
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuizResult, AIConfig, InterviewerStyle } from "../types";

const GEMINI_MODEL = "gemini-3-flash-preview";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// --- Gemini Schemas ---
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
        }
      }
    }
  },
  required: ['overallScore', 'overallFeedback', 'questionAnalysis', 'dimensions']
};

// --- Shared System Prompt ---
const getSystemInstruction = (style: InterviewerStyle) => {
  const styles = {
    standard: "标准大厂面试风格。",
    deep_dive: "专家级，深挖底层原理和实现机制。",
    stress: "压力面试，追问细节，语气严肃。",
    project_focused: "实战向，关注工业界落地和性能调优。"
  };
  return `你是一位 C++ 后端技术面试官。
  风格：${styles[style]}
  核心规则：
  1. 【绝对硬性】所有输出必须为全中文。
  2. 【绝对禁令】严禁要求写代码。仅限理论、原理、架构讨论。
  3. 考察重点：Linux、C++ 语言基础、多线程并发。
  4. 保持高效。`;
};

// --- Helper: DeepSeek Fetcher ---
async function callDeepSeek(apiKey: string, messages: any[], temperature: number): Promise<string> {
  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: temperature,
        response_format: { type: 'json_object' }, // Enforce JSON mode
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "{}";
  } catch (error) {
    console.error("DeepSeek Request Failed:", error);
    throw error;
  }
}

// --- Main Functions ---

export const generateInterviewQuestions = async (
  topics: string[], 
  config: AIConfig, 
  resumeText?: string,
  style: InterviewerStyle = 'standard'
): Promise<Question[]> => {
  const apiKey = config.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("Missing API Key");

  const prompt = `生成 5 道关于 [${topics.join(', ')}] 的 C++ 后端面试简答题。
  要求：全中文，无代码题，侧重原理。
  ${resumeText ? `参考背景：${resumeText}` : ''}`;

  // Branch Logic
  if (config.provider === 'deepseek') {
    const systemText = getSystemInstruction(style) + `
    请严格输出纯 JSON 格式（不要使用 Markdown 代码块）：
    [
      { "id": 1, "type": "concept", "text": "题目描述", "difficulty": "简单" }
    ]
    `;
    
    const jsonStr = await callDeepSeek(apiKey, [
      { role: 'system', content: systemText },
      { role: 'user', content: prompt }
    ], 1.0); // DeepSeek is creative

    // Cleanup potentially messy JSON from LLM
    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const raw = JSON.parse(cleanJson);
    return raw.map((q: any) => ({
      ...q,
      category: topics[0],
      tags: topics,
      type: q.type || 'concept'
    }));

  } else {
    // Gemini Implementation
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: getSystemInstruction(style),
        temperature: 0.8,
      },
    });
    
    const raw = JSON.parse(response.text || "[]");
    return raw.map((q: any) => ({
      ...q,
      category: topics[0],
      tags: topics,
      type: q.type || 'concept'
    }));
  }
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>,
  config: AIConfig,
  style: InterviewerStyle
): Promise<QuizResult> => {
  const apiKey = config.apiKey || process.env.API_KEY;
  if (!apiKey) throw new Error("Missing API Key");

  const context = questions.map(q => `问：${q.text}\n答：${answers[q.id] || "未回答"}`).join('\n\n');
  const prompt = `评估以下面试表现（全中文）：\n${context}`;

  if (config.provider === 'deepseek') {
    const systemText = getSystemInstruction(style) + `
    请严格输出纯 JSON 对象（不要使用 Markdown 代码块），结构如下：
    {
      "overallScore": number,
      "overallFeedback": string,
      "dimensions": { "knowledge": number, "logic": number, "system": number, "communication": number },
      "questionAnalysis": [
        { "questionId": number, "score": number, "feedback": string, "standardAnswer": string }
      ],
      "learningPath": [ { "title": string, "description": string, "resources": string[] } ]
    }
    `;

    const jsonStr = await callDeepSeek(apiKey, [
      { role: 'system', content: systemText },
      { role: 'user', content: prompt }
    ], 0.2); // Low temp for analysis

    const cleanJson = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanJson);
    
    // Normalize result
    result.questionAnalysis = result.questionAnalysis.map((qa: any) => ({
      ...qa,
      questionText: questions.find(q => q.id === qa.questionId)?.text || '',
      userAnswer: answers[qa.questionId] || "(未回答)",
      questionType: questions.find(q => q.id === qa.questionId)?.type || 'concept'
    }));
    return result;

  } else {
    // Gemini Implementation
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: getSystemInstruction(style),
        temperature: 0.1,
      },
    });

    const result = JSON.parse(response.text || "{}") as QuizResult;
    result.questionAnalysis = result.questionAnalysis.map(qa => ({
      ...qa,
      questionText: questions.find(q => q.id === qa.questionId)?.text || '',
      userAnswer: answers[qa.questionId] || "(未回答)",
      questionType: questions.find(q => q.id === qa.questionId)?.type || 'concept'
    }));
    return result;
  }
};
