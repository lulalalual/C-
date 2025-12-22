
export enum AppState {
  LOGIN = 'LOGIN',
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  SELECTION = 'SELECTION',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

export type AIProvider = 'gemini';

export interface AIConfig {
  provider: AIProvider;
  apiKey: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'system' | 'concurrency';
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
  { id: 'cpp_lang', name: 'C++ 语言深度', description: '内存模型, 虚函数, 模板, 智能指针', icon: 'Code', category: 'core' },
  { id: 'cpp_stl', name: 'STL 与标准库', description: '容器实现原理, 迭代器失效, 空间配置器', icon: 'Zap', category: 'core' },
  { id: 'cpp_concurrency', name: '多线程并发', description: '锁机制, 原子操作, 内存序, 线程池', icon: 'Cpu', category: 'concurrency' },
  { id: 'linux_os', name: 'Linux 内核与系统', description: '进程线程管理, 虚拟内存, 信号量', icon: 'Terminal', category: 'system' },
  { id: 'linux_net', name: 'Linux 网络编程', description: 'Epoll 原理, Reactor 模式, TCP 协议栈', icon: 'Globe', category: 'system' },
  { id: 'linux_fs', name: '文件系统与 I/O', description: 'VFS, 零拷贝技术, 磁盘调度', icon: 'HardDrive', category: 'system' },
];
