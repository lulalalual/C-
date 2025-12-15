import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuizResult, AIConfig } from "../types";

// --- Configuration & Schemas ---

const GEMINI_MODEL = "gemini-2.5-flash";
const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// Schema definitions for Gemini (Structured Output)
const geminiQuestionSchema: Schema = {
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

const geminiAnalysisSchema: Schema = {
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

// --- Helper Functions ---

const cleanJsonString = (str: string): string => {
  // Remove markdown code blocks if present (common with DeepSeek/OpenAI)
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

// --- API Calls ---

export const generateInterviewQuestions = async (topics: string[], config: AIConfig): Promise<Question[]> => {
  const topicList = topics.join(', ');
  const systemPrompt = "你是一位来自中国一线互联网大厂（如腾讯、字节跳动）的资深 C++ 技术面试官。请用中文出题。";
  const userPrompt = `
    Generate 10 technical interview short-answer questions for a C++ Backend Intern position.
    Focus on these topics: ${topicList}.
    The questions MUST be based on real interview questions from top Chinese tech giants like Tencent (腾讯), ByteDance (字节跳动), Alibaba (阿里), and Meituan (美团).
    
    IMPORTANT: OUTPUT MUST BE IN CHINESE (SIMPLIFIED).
    
    Mix difficulties: 3 简单 (Easy), 4 中等 (Medium), 3 困难 (Hard).
    
    Examples of style:
    - "请简述虚函数的实现机制。"
    - "select、poll 和 epoll 有什么区别？为什么 epoll 效率更高？"
    - "std::shared_ptr 是如何实现引用计数的？它是线程安全的吗？"
    
    Return a STRICT JSON ARRAY. No markdown formatting.
    Format:
    [
      { "id": 1, "category": "C++", "text": "Question?", "difficulty": "简单" }
    ]
  `;

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiQuestionSchema,
        systemInstruction: systemPrompt,
      },
    });
    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text) as Question[];
  } 
  
  else if (config.provider === 'deepseek') {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt + " You must respond with a JSON object." },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`DeepSeek API Error: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from DeepSeek");
    
    // DeepSeek might return { "questions": [...] } or just [...] depending on how it interpreted "JSON Object" vs "Array"
    // We try to parse and handle both.
    const parsed = JSON.parse(cleanJsonString(content));
    if (Array.isArray(parsed)) return parsed;
    if (parsed.questions && Array.isArray(parsed.questions)) return parsed.questions;
    // Fallback: try to find an array in values
    const possibleArray = Object.values(parsed).find(v => Array.isArray(v));
    if (possibleArray) return possibleArray as Question[];
    
    throw new Error("DeepSeek response format unexpected");
  }

  throw new Error("Invalid Provider");
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>,
  config: AIConfig
): Promise<QuizResult> => {
  
  const qaPairs = questions.map(q => ({
    id: q.id,
    question: q.text,
    difficulty: q.difficulty,
    category: q.category,
    candidateAnswer: answers[q.id] || "(未回答)"
  }));

  const systemPrompt = "你是一位严厉但乐于助人的资深 C++ 架构师。你非常看重候选人对内存管理、并发编程和操作系统内核的深度理解。请用中文进行点评和分析。";
  const userPrompt = `
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
    
    Return pure JSON.
    Format Structure:
    {
      "overallScore": number,
      "overallFeedback": "string",
      "questionAnalysis": [
         { "questionId": number, "questionText": "string", "score": number, "feedback": "string", "standardAnswer": "string" }
      ],
      "learningPath": [
         { "title": "string", "description": "string", "resources": ["string"] }
      ]
    }
  `;

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiAnalysisSchema,
        systemInstruction: systemPrompt,
      },
    });

    if (!response.text) throw new Error("No analysis from Gemini");
    const result = JSON.parse(response.text) as QuizResult;
    // Inject user answers
    result.questionAnalysis = result.questionAnalysis.map(qa => ({
      ...qa,
      userAnswer: answers[qa.questionId] || "(未回答)"
    }));
    return result;
  }

  else if (config.provider === 'deepseek') {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: DEEPSEEK_MODEL,
        messages: [
          { role: 'system', content: systemPrompt + " You must respond with a JSON object." },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`DeepSeek API Error: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) throw new Error("No content from DeepSeek");
    
    const result = JSON.parse(cleanJsonString(content)) as QuizResult;
    result.questionAnalysis = result.questionAnalysis.map(qa => ({
      ...qa,
      userAnswer: answers[qa.questionId] || "(未回答)"
    }));
    return result;
  }

  throw new Error("Invalid Provider");
};
