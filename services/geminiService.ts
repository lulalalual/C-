import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuizResult, QuestionAnalysis, LearningStep } from "../types";

const MODEL_NAME = "gemini-2.5-flash";

// Helper to lazily get the AI instance. 
// This prevents the app from crashing at startup if the API key environment variable 
// isn't immediately available or if the SDK throws an error during initialization.
const getAI = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

// Schema definitions for structured output

const questionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      category: { type: Type.STRING },
      text: { type: Type.STRING },
      difficulty: { type: Type.STRING, enum: ['简单', '中等', '困难'] },
    },
    required: ['id', 'category', 'text', 'difficulty'],
  }
};

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER, description: "Overall score out of 100" },
    overallFeedback: { type: Type.STRING, description: "General feedback on the candidate's performance" },
    questionAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.INTEGER },
          questionText: { type: Type.STRING },
          score: { type: Type.INTEGER, description: "Score out of 10" },
          feedback: { type: Type.STRING, description: "Specific feedback on what was missing or wrong" },
          standardAnswer: { type: Type.STRING, description: "The correct technical answer expected by top tech companies" },
        },
        required: ['questionId', 'questionText', 'score', 'feedback', 'standardAnswer']
      }
    },
    learningPath: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          resources: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of topics or keywords to study"
          }
        },
        required: ['title', 'description', 'resources']
      }
    }
  },
  required: ['overallScore', 'overallFeedback', 'questionAnalysis', 'learningPath']
};

export const generateInterviewQuestions = async (topics: string[]): Promise<Question[]> => {
  const topicList = topics.join(', ');
  const prompt = `
    Generate 10 technical interview short-answer questions for a C++ Backend Intern position.
    Focus on these topics: ${topicList}.
    The questions MUST be based on real interview questions from top Chinese tech giants like Tencent (腾讯), ByteDance (字节跳动), Alibaba (阿里), and Meituan (美团).
    
    IMPORTANT: OUTPUT MUST BE IN CHINESE (SIMPLIFIED).
    
    Mix difficulties: 3 简单 (Easy), 4 中等 (Medium), 3 困难 (Hard).
    
    Examples of style:
    - "请简述虚函数的实现机制。" (Explain the implementation mechanism of virtual functions.)
    - "select、poll 和 epoll 有什么区别？为什么 epoll 效率更高？" (What is the difference between select, poll, and epoll? Why is epoll more efficient?)
    - "std::shared_ptr 是如何实现引用计数的？它是线程安全的吗？" (How does std::shared_ptr implement reference counting and is it thread-safe?)
    
    Return pure JSON matching the schema.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: questionSchema,
        systemInstruction: "你是一位来自中国一线互联网大厂（如腾讯、字节跳动）的资深 C++ 技术面试官。请用中文出题。",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as Question[];
  } catch (error) {
    console.error("Failed to generate questions:", error);
    // Fallback or rethrow
    throw error;
  }
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>
): Promise<QuizResult> => {
  
  const qaPairs = questions.map(q => ({
    id: q.id,
    question: q.text,
    difficulty: q.difficulty,
    category: q.category,
    candidateAnswer: answers[q.id] || "(未回答)"
  }));

  const prompt = `
    Analyze the following C++ Backend Intern interview session.
    
    Data:
    ${JSON.stringify(qaPairs, null, 2)}
    
    Task:
    1. Grade each answer on a scale of 0-10 based on technical accuracy, depth, and clarity.
    2. Provide a standard "Model Answer" (参考答案) that one would expect from a hired candidate at Tencent or ByteDance.
    3. Provide constructive feedback (点评).
    4. Calculate an overall score (0-100).
    5. Generate a personalized learning path/roadmap (学习路径) based on their weak points.

    IMPORTANT: OUTPUT MUST BE IN CHINESE (SIMPLIFIED).
    
    Return pure JSON matching the schema.
  `;

  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "你是一位严厉但乐于助人的资深 C++ 架构师。你非常看重候选人对内存管理、并发编程和操作系统内核的深度理解。请用中文进行点评和分析。",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No analysis from AI");
    
    // Inject user answers back into the result for display purposes if needed, 
    // although the schema already asks for questionText, we augment it to be safe.
    const result = JSON.parse(text) as QuizResult;
    
    // Ensure user answers are attached (sometimes AI might summarize differently)
    result.questionAnalysis = result.questionAnalysis.map(qa => ({
      ...qa,
      userAnswer: answers[qa.questionId] || "(未回答)"
    }));

    return result;
  } catch (error) {
    console.error("Failed to analyze answers:", error);
    throw error;
  }
};