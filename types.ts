
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

export type QuestionType = 'concept' | 'scenario' | 'design';
export type InterviewerStyle = 'standard' | 'deep_dive' | 'stress' | 'project_focused';

export interface Question {
  id: number;
  category: string;
  type: QuestionType;
  tags: string[];
  text: string;
  difficulty: '简单' | '中等' | '困难';
}

export interface MistakeRecord {
  id: string;
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
    logic: number;
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
  { id: 'cpp_basics', name: 'C++ 基础与 STL', description: '容器, 迭代器, 常用关键字原理', icon: 'Code', category: 'core' },
  { id: 'cpp_modern', name: '现代 C++ 特性', description: '智能指针, 右值引用, 内存模型', icon: 'Zap', category: 'core' },
  { id: 'cpp_oop', name: '面向对象与设计模式', description: '虚函数表, 多态实现, 常用模式', icon: 'Box', category: 'core' },
  { id: 'cpp_concurrency', name: '多线程与并发', description: '原子操作, 锁机制, 线程池原理', icon: 'Cpu', category: 'system' },
  { id: 'linux_sys', name: 'Linux 系统编程', description: '进程线程管理, 信号处理, VFS', icon: 'Terminal', category: 'system' },
  { id: 'cpp_net', name: '高性能网络 IO', description: 'Epoll, Reactor, TCP/IP 协议栈深度', icon: 'Globe', category: 'system' },
  { id: 'system_design', name: '后端系统设计', description: '架构演进, 分布式一致性, 缓存策略', icon: 'Layers', category: 'advanced' },
  { id: 'performance', name: '性能调优与排查', description: '内存泄漏定位, 锁竞争优化, GDB 技巧', icon: 'Activity', category: 'advanced' },
];
