
export enum AppState {
  LOGIN = 'LOGIN',
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  SELECTION = 'SELECTION',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export type AIProvider = 'gemini' | 'deepseek';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'system' | 'advanced';
}

export type QuestionType = 'concept' | 'code' | 'design';
export type InterviewerStyle = 'standard' | 'deep_dive' | 'stress' | 'project_focused';

export interface Question {
  id: number;
  category: string;
  type: QuestionType;
  tags: string[];
  text: string;
  codeSnippet?: string;
  difficulty: '简单' | '中等' | '困难';
}

export interface MistakeRecord {
  id: string; // unique ID
  question: Question;
  userAnswer: string;
  feedback: string;
  date: string;
}

export interface QuizResult {
  overallScore: number;
  overallFeedback: string;
  questionAnalysis: QuestionAnalysis[];
  learningPath: LearningStep[];
  dimensions: {
    knowledge: number;
    coding: number;
    system: number;
    communication: number;
  };
}

export interface QuestionAnalysis {
  questionId: number;
  questionText: string;
  questionType: QuestionType;
  userAnswer: string;
  score: number;
  feedback: string;
  standardAnswer: string;
  codeFeedback?: {
    isCompilable: boolean;
    output?: string;
    efficiency?: string;
    modernCppUsage?: string;
  };
}

export interface LearningStep {
  title: string;
  description: string;
  resources: string[];
}

export interface UserHistoryItem {
  date: string;
  score: number;
  topicIds: string[];
}

export interface UserProfile {
  username: string;
  aiConfig: AIConfig | null;
  history: UserHistoryItem[];
  mistakes: MistakeRecord[];
}

export const AVAILABLE_TOPICS: Topic[] = [
  // C++ Core
  { id: 'cpp_basics', name: 'C++ 基础与 STL', description: '容器, 迭代器, 算法, 常用关键字', icon: 'Code', category: 'core' },
  { id: 'cpp_modern', name: '现代 C++ (11-20)', description: '智能指针, Lambda, 右值引用, Concepts', icon: 'Zap', category: 'core' },
  { id: 'cpp_oop', name: '面向对象与设计模式', description: '虚函数, 多态, 单例/工厂/观察者模式', icon: 'Box', category: 'core' },
  { id: 'cpp_memory', name: '内存管理深度解析', description: 'RAII, 内存池, 内存泄漏排查, Allocator', icon: 'Database', category: 'core' },
  
  // System Programming
  { id: 'cpp_concurrency', name: '多线程与并发', description: 'Thread, Mutex, Atomic, 内存模型, 死锁', icon: 'Cpu', category: 'system' },
  { id: 'linux_sys', name: 'Linux 系统编程', description: 'IPC, 信号, 进程调度, 文件系统', icon: 'Terminal', category: 'system' },
  { id: 'cpp_net', name: '网络编程高性能 IO', description: 'Socket, Epoll, Reactor, TCP/IP 状态机', icon: 'Globe', category: 'system' },
  
  // Advanced
  { id: 'system_design', name: '后端系统设计', description: '分布式, 缓存(Redis), 负载均衡, 数据库设计', icon: 'Layers', category: 'advanced' },
  { id: 'performance', name: '性能优化与调试', description: 'GDB, Perf, 火焰图, 锁竞争优化', icon: 'Activity', category: 'advanced' },
];