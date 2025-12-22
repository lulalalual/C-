
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuizResult, AIConfig, InterviewerStyle } from "../types";

const GEMINI_MODEL = "gemini-3-flash-preview";

// 极简题目架构 - 减少 Token 传输
const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      type: { type: Type.STRING },
      text: { type: Type.STRING },
      difficulty: { type: Type.STRING },
    },
    required: ['id', 'type', 'text', 'difficulty'],
  }
};

// 紧凑型分析架构
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER },
    overallFeedback: { type: Type.STRING },
    dimensions: {
      type: Type.OBJECT,
      properties: {
        knowledge: { type: Type.INTEGER },
        logic: { type: Type.INTEGER },
        system: { type: Type.INTEGER },
        communication: { type: Type.INTEGER },
      },
      required: ['knowledge', 'logic', 'system', 'communication']
    },
    questionAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.INTEGER },
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          standardAnswer: { type: Type.STRING },
        },
        required: ['questionId', 'score', 'feedback', 'standardAnswer']
      }
    },
    learningPath: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          resources: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'description', 'resources']
      }
    }
  },
  required: ['overallScore', 'overallFeedback', 'questionAnalysis', 'learningPath', 'dimensions']
};

const getSystemInstruction = (style: InterviewerStyle) => {
  const styles = {
    standard: "专业一线大厂风格，注重基础与工程规范。",
    deep_dive: "技术专家风格，深挖底层原理、内存模型及源码实现。",
    stress: "压力面试风格，语气严肃，对回答漏洞进行连环追问。",
    project_focused: "实战负责人风格，关注项目细节与工程落地。"
  };
  return `你是一位 C++ 后端技术面试官。
  角色定位：${styles[style]}
  硬性要求：
  1. 题目、点评、解析、学习建议必须【全中文】。
  2. 严禁要求写代码，只出简答题/原理题。
  3. 回复格式必须严格符合 JSON 规范。
  4. 保持高效、精准，不废话。`;
};

export const generateInterviewQuestions = async (
  topics: string[], 
  config: AIConfig, 
  resumeText?: string,
  style: InterviewerStyle = 'standard'
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const prompt = `为 C++ 后端实习生生成 5 道中文面试题。
  范围：${topics.join(', ')}。
  ${resumeText ? `结合简历：${resumeText}` : ''}
  题目需具有区分度，涵盖原理、机制或架构。`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: questionSchema,
      systemInstruction: getSystemInstruction(style),
      temperature: 0.7, // 适度随机性
    },
  });
  
  const rawQuestions = JSON.parse(response.text || "[]");
  return rawQuestions.map((q: any) => ({
    ...q,
    category: topics[0],
    tags: topics,
    type: q.type || 'concept'
  })) as Question[];
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>,
  config: AIConfig,
  style: InterviewerStyle
): Promise<QuizResult> => {
  const ai = new GoogleGenAI({ apiKey: config.apiKey });
  const context = questions.map(q => `问：${q.text}\n答：${answers[q.id] || "未回答"}`).join('\n\n');
  
  const prompt = `请对以下面试表现进行中文评估：\n${context}\n\n给出评分、分析及参考路径。`;

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: analysisSchema,
      systemInstruction: getSystemInstruction(style),
      temperature: 0.2, // 评估需更稳定
    },
  });

  const result = JSON.parse(response.text || "{}") as QuizResult;
  // 补全 UI 渲染所需字段
  result.questionAnalysis = result.questionAnalysis.map(qa => ({
    ...qa,
    questionText: questions.find(q => q.id === qa.questionId)?.text || '',
    userAnswer: answers[qa.questionId] || "(未回答)",
    questionType: questions.find(q => q.id === qa.questionId)?.type || 'concept'
  }));
  return result;
};
