import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Question, QuizResult, AIConfig, InterviewerStyle } from "../types";

// --- Configuration ---

const GEMINI_MODEL = "gemini-2.5-flash";
const DEEPSEEK_MODEL = "deepseek-chat";
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

// --- Schemas ---

const geminiQuestionSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.INTEGER },
      category: { type: Type.STRING },
      type: { type: Type.STRING, enum: ['concept', 'code', 'design'] },
      tags: { type: Type.ARRAY, items: { type: Type.STRING } },
      text: { type: Type.STRING },
      codeSnippet: { type: Type.STRING, description: "Initial code provided to user for coding questions, or empty for others." },
      difficulty: { type: Type.STRING, enum: ['简单', '中等', '困难'] },
    },
    required: ['id', 'category', 'type', 'text', 'difficulty'],
  }
};

const geminiAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    overallScore: { type: Type.INTEGER },
    overallFeedback: { type: Type.STRING },
    dimensions: {
      type: Type.OBJECT,
      properties: {
        knowledge: { type: Type.INTEGER },
        coding: { type: Type.INTEGER },
        system: { type: Type.INTEGER },
        communication: { type: Type.INTEGER },
      },
      required: ['knowledge', 'coding', 'system', 'communication']
    },
    questionAnalysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          questionId: { type: Type.INTEGER },
          questionText: { type: Type.STRING },
          score: { type: Type.INTEGER },
          feedback: { type: Type.STRING },
          standardAnswer: { type: Type.STRING },
          codeFeedback: {
            type: Type.OBJECT,
            properties: {
              isCompilable: { type: Type.BOOLEAN },
              output: { type: Type.STRING },
              efficiency: { type: Type.STRING },
              modernCppUsage: { type: Type.STRING },
            },
            nullable: true
          }
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
          resources: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ['title', 'description', 'resources']
      }
    }
  },
  required: ['overallScore', 'overallFeedback', 'questionAnalysis', 'learningPath', 'dimensions']
};

const geminiCodeRunSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    isCompilable: { type: Type.BOOLEAN },
    stdout: { type: Type.STRING, description: "Simulated standard output" },
    stderr: { type: Type.STRING, description: "Simulated compiler errors or runtime warnings" },
    analysis: { type: Type.STRING, description: "Brief analysis of logic or memory safety (e.g., Memory Leaks)" }
  },
  required: ['isCompilable', 'stdout', 'stderr', 'analysis']
};

// --- Helper Functions ---

const cleanJsonString = (str: string): string => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

const getSystemPromptByStyle = (style: InterviewerStyle): string => {
  switch (style) {
    case 'stress': return "你是一位压力面试官。你会针对候选人的弱点进行连续追问，问题难度较大，考察极限场景下的系统稳定性与容灾能力。";
    case 'deep_dive': return "你是一位专注于底层原理的架构师。你非常看重 C++ 内存模型、Linux 内核原理、源码级实现细节。拒绝浅尝辄止的回答。";
    case 'project_focused': return "你是一位务实的技术负责人。你关注项目实战经验，问题应紧贴实际业务场景（如高并发、服务治理、线上排查）。";
    default: return "你是一位专业、客观的一线互联网大厂（腾讯/字节）C++ 面试官。注重基础扎实度与工程规范。";
  }
};

// --- API Calls ---

export const generateInterviewQuestions = async (
  topics: string[], 
  config: AIConfig, 
  resumeText?: string,
  style: InterviewerStyle = 'standard'
): Promise<Question[]> => {
  const topicList = topics.join(', ');
  const systemPrompt = `${getSystemPromptByStyle(style)} 请用中文出题。`;
  
  let userPrompt = `
    Generate 5 high-quality technical interview questions for a C++ Backend Intern position.
    Structure:
    - 2 "Code" questions: Require writing C++ code (e.g., implement a thread-safe queue, RAII wrapper, string class, or algorithmic task). Provide function signature in 'codeSnippet'.
    - 2 "Concept" questions: Deep dive into C++ features, OS, or Network.
    - 1 "Design" question: System design or Scenario analysis (e.g., design a log system).

    Difficulty: Mix of Medium and Hard.
    
    Topics to cover: ${topicList}.
  `;

  if (resumeText && resumeText.trim().length > 0) {
    userPrompt += `
    
    CANDIDATE RESUME:
    """
    ${resumeText}
    """
    
    INSTRUCTIONS:
    The candidate has provided their resume. 
    1. EXTRACT real technical challenges or specific technologies mentioned (e.g. "Optimized Redis usage", "Used Epoll").
    2. Generate questions that CHALLENGE these specific points. "You mentioned X, how exactly did you implement Y inside it?"
    3. If the resume is thin, ask standard hard questions about C++11/14/17 features and Linux System Programming.
    `;
  }

  userPrompt += `
    OUTPUT FORMAT: STRICT JSON ARRAY.
    Keys: id, category, type (concept/code/design), tags[], text, codeSnippet (optional string), difficulty.
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
          { role: 'system', content: systemPrompt + " Return a JSON Array." },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) throw new Error("DeepSeek API Error");
    const data = await response.json();
    const content = cleanJsonString(data.choices?.[0]?.message?.content || "");
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.questions || []);
  }

  throw new Error("Invalid Provider");
};

// --- SIMULATED COMPILER ---
export const simulateCppExecution = async (code: string, questionText: string, config: AIConfig) => {
  const systemPrompt = "You are a C++ Compiler (GCC 12) and Static Analysis Tool (Clang-Tidy). You act as a sandbox.";
  const userPrompt = `
    Compile and 'Run' the following C++ code which is an answer to: "${questionText}".
    
    Code:
    """
    ${code}
    """
    
    Task:
    1. Check for compilation errors.
    2. If it compiles, simulate the logic output (stdout).
    3. Check for logic bugs, memory leaks, or race conditions.
    4. Provide a JSON response.
  `;

  if (config.provider === 'gemini') {
    const ai = new GoogleGenAI({ apiKey: config.apiKey });
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: geminiCodeRunSchema,
        systemInstruction: systemPrompt,
      },
    });
    if (!response.text) return { isCompilable: false, stdout: "", stderr: "AI Error", analysis: "" };
    return JSON.parse(response.text);
  }
  
  // Fallback for DeepSeek (simplified for brevity, similar structure)
  // ... DeepSeek implementation would go here, returning strict JSON
  return { isCompilable: true, stdout: "(DeepSeek simulation pending implementation)", stderr: "", analysis: "Simulation not available for DeepSeek yet." };
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>,
  config: AIConfig,
  style: InterviewerStyle
): Promise<QuizResult> => {
  
  const qaPairs = questions.map(q => ({
    id: q.id,
    question: q.text,
    type: q.type,
    candidateAnswer: answers[q.id] || "(未回答)"
  }));

  const systemPrompt = getSystemPromptByStyle(style) + " 你现在正在阅卷。请严格打分，并提供深度技术反馈。";
  const userPrompt = `
    Analyze this C++ interview session.
    
    Data: ${JSON.stringify(qaPairs)}
    
    Tasks:
    1. Score each dimension (Knowledge, Coding, System, Communication) 0-100.
    2. For CODE questions: Check correctness, Time/Space Complexity, Safety (memory leaks, thread safety), and Modern C++ usage.
    3. For DESIGN questions: Check scalability, fault tolerance, and feasibility.
    4. Generate Learning Path tailored to weak areas.
    
    Output JSON.
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
    const result = JSON.parse(response.text) as QuizResult;
    // Inject user answers back for display
    result.questionAnalysis = result.questionAnalysis.map(qa => ({
      ...qa,
      userAnswer: answers[qa.questionId] || "(未回答)",
      questionType: questions.find(q => q.id === qa.questionId)?.type || 'concept'
    }));
    return result;
  }

  // DeepSeek fallback...
  // For brevity, assuming Gemini is primary or user handles DeepSeek sim similarly
  throw new Error("DeepSeek analysis pending implementation in this complex schema");
};