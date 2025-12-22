
import { Question, QuizResult, AIConfig, InterviewerStyle, QuestionDifficulty } from "../types";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";

/**
 * DeepSeek API 调用核心函数
 */
async function callDeepSeek(apiKey: string, systemPrompt: string, userPrompt: string, temperature: number = 1.0): Promise<any> {
  if (!apiKey) throw new Error("API Key 未配置");

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: temperature,
        response_format: { type: 'json_object' },
        stream: false,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMsg = `API 请求失败 (${response.status})`;
      try {
        const errorJson = JSON.parse(errorText);
        if (errorJson.error && errorJson.error.message) {
          errorMsg = `DeepSeek 错误: ${errorJson.error.message}`;
        }
      } catch (e) {
        // ignore
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const cleanJson = content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("DeepSeek Call Failed:", error);
    throw error;
  }
}

// --- 系统提示词构建 ---

const getSystemInstruction = (style: InterviewerStyle) => {
  // 全中文的风格描述，针对不同风格进行了深度的定制
  const styles = {
    standard: `你是国内一线互联网大厂（如腾讯、字节跳动、阿里）的资深后端面试官。
    你的风格专业、理性、平和。请侧重考察候选人的计算机基础（操作系统、网络、数据库）是否扎实，以及对 C++ 语言特性的理解是否准确。
    题目应当是经典的“八股文”与实际应用相结合，难度适中，旨在筛选出基础合格的工程师。`,
    
    deep_dive: `你是一位对技术有极致追求的内核级专家或资深架构师（类似 T9/P8 级别）。
    你极度厌恶表面功夫和死记硬背。你的提问风格是“打破沙锅问到底”，请务必深挖底层实现原理（如 Linux 内核源码机制、汇编层面的内存模型、STL 容器的内部实现细节、Zero-Copy 的具体系统调用路径等）。
    请提出那些只有真正阅读过源码或深入研究过底层的人才能回答的问题，难度偏高，关注“为什么”和“怎么实现”。`,
    
    stress: `你正在进行一场高强度的“压力面试”。
    你的态度严肃、犀利，甚至略带质疑和挑剔。请假设候选人的回答可能存在漏洞，并针对极端场景（如高并发雪崩、内存耗尽、网络分区、频繁 GC/Swap）进行追问。
    请提出具有挑战性的边界条件问题，考察候选人在高压下的逻辑思维严密性和抗压能力。不要接受模棱两可的答案。`,
    
    project_focused: `你是一位务实的一线 Team Leader 或技术负责人。
    你不太关心纯理论的背诵，而是极度关注工程落地能力、线上故障排查经验和架构设计权衡。
    请结合实际生产环境场景（如线上 CPU 100%、死锁排查、数据库慢查询优化、Coredump 分析、系统崩溃恢复）来出题。
    重点考察候选人解决实际问题的能力和工具链（GDB, Perf, eBPF）的使用经验。`
  };
  
  return `${styles[style]}
  
  【核心规则】
  1. 必须使用中文与候选人交互。
  2. 仅提供“简答题”，不要要求编写完整代码，重点考察原理、思路和设计。
  3. 必须严格输出合法的 JSON 格式。`;
};

// --- 业务函数 ---

export const generateInterviewQuestions = async (
  topics: string[], 
  config: AIConfig,
  count: number,
  difficulty: QuestionDifficulty,
  resumeText?: string,
  style: InterviewerStyle = 'standard'
): Promise<Question[]> => {
  
  const systemPrompt = `${getSystemInstruction(style)}
  请生成 ${count} 道面试题。
  输出必须是如下 JSON 格式的数组：
  [
    { 
      "id": 1, 
      "category": "所属分类", 
      "type": "concept", 
      "text": "问题描述", 
      "difficulty": "简单/中等/困难" 
    }
  ]`;

  let difficultyDesc = "";
  if (difficulty === 'easy') difficultyDesc = "难度侧重于基础概念和常见八股文，适合初级工程师。";
  else if (difficulty === 'medium') difficultyDesc = "难度适中，结合原理与应用，适合中级工程师。";
  else if (difficulty === 'hard') difficultyDesc = "难度较高，涉及复杂场景、底层源码和架构设计，适合高级工程师。";
  else difficultyDesc = "难度需要混合搭配，简单、中等、困难题目都要有，覆盖面要广。";

  const userPrompt = `请基于以下技术考点生成题目：[${topics.join(', ')}]。
  
  【配置要求】
  1. 题目数量：${count} 道。
  2. 难度偏好：${difficultyDesc}
  3. 考点必须包含：C++语言特性、操作系统/Linux、计算机网络、数据库、分布式架构或工具链中的部分内容。
  ${resumeText ? `4. 请结合候选人简历内容进行针对性提问：${resumeText}` : ''}
  
  请确保题目类型为“简答题”，不需要代码填空。`;

  try {
    const questions = await callDeepSeek(config.apiKey, systemPrompt, userPrompt, 1.1);
    
    const list = Array.isArray(questions) ? questions : (questions.questions || []);
    
    return list.map((q: any, index: number) => ({
      ...q,
      id: index + 1,
      tags: topics,
      // 容错处理：如果 AI 返回了不在定义里的 difficulty
      difficulty: ['简单', '中等', '困难'].includes(q.difficulty) ? q.difficulty : '中等'
    }));
  } catch (e) {
    console.error("Generate Questions Error", e);
    throw new Error("生成题目失败，请检查 API Key 或网络连接。");
  }
};

export const analyzeInterviewPerformance = async (
  questions: Question[],
  answers: Record<number, string>,
  config: AIConfig,
  style: InterviewerStyle
): Promise<QuizResult> => {
  
  const context = questions.map(q => `【题目${q.id}】(${q.difficulty}): ${q.text}\n【用户回答】: ${answers[q.id] || "未回答"}`).join('\n\n');

  const systemPrompt = `${getSystemInstruction(style)}
  请对用户的面试表现进行评分和点评。
  输出必须是严格的 JSON 对象，格式如下：
  {
    "overallScore": 0-100之间的整数,
    "overallFeedback": "整体点评字符串",
    "dimensions": {
      "knowledge": 0-100,
      "logic": 0-100,
      "system": 0-100,
      "communication": 0-100
    },
    "questionAnalysis": [
      {
        "questionId": 对应题目ID(整数),
        "score": 0-100,
        "feedback": "针对该题的点评",
        "standardAnswer": "该题的参考标准答案（解析）"
      }
    ],
    "learningPath": [
      { "title": "建议学习阶段标题", "description": "描述", "resources": ["推荐书籍或关键词"] }
    ]
  }`;

  const userPrompt = `请根据以下面试记录进行评估：\n\n${context}`;

  try {
    const result = await callDeepSeek(config.apiKey, systemPrompt, userPrompt, 0.2);
    
    result.questionAnalysis = result.questionAnalysis.map((qa: any) => ({
      ...qa,
      questionText: questions.find(q => q.id === qa.questionId)?.text || '未知题目',
      userAnswer: answers[qa.questionId] || "(未回答)",
      questionType: 'concept'
    }));

    return result as QuizResult;
  } catch (e) {
    console.error("Analyze Performance Error", e);
    throw new Error("分析结果失败，请稍后重试。");
  }
};
