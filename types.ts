
export enum AppState {
  LOGIN = 'LOGIN',
  WELCOME = 'WELCOME',
  DASHBOARD = 'DASHBOARD',
  SELECTION = 'SELECTION',
  QUIZ = 'QUIZ',
  ANALYZING = 'ANALYZING',
  RESULTS = 'RESULTS',
}

// 移除多模型选择，仅支持 DeepSeek
export interface AIConfig {
  apiKey: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'core' | 'infra' | 'architecture';
}

export type QuestionType = 'concept'; // 仅简答题/概念题
export type InterviewerStyle = 'standard' | 'deep_dive' | 'stress' | 'project_focused';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

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
  scoreExplanation?: string;
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

// 合并后的题库 + 新增的高级话题
export const AVAILABLE_TOPICS: Topic[] = [
  // 核心能力 (合并了原来的 Basic/Adv/STL)
  { id: 'cpp_core', name: 'C++ 语言核心', description: '内存模型, 智能指针, STL 原理, C++11~20 新特性, 模板元编程', icon: 'Code', category: 'core' },
  { id: 'cpp_concurrency', name: '高并发与多线程', description: '锁机制, 原子操作, 内存序, 线程池, 协程', icon: 'Cpu', category: 'core' },
  
  // 底层设施 (合并了 OS/Linux/Network)
  { id: 'system_kernel', name: 'OS 与 Linux 内核', description: '进程管理, 虚拟内存, 零拷贝, IO 模型(Epoll), 文件系统', icon: 'Terminal', category: 'infra' },
  { id: 'network_prog', name: '网络编程协议', description: 'TCP/IP 栈, Socket, HTTP/HTTPS, QUIC, RPC 原理', icon: 'Globe', category: 'infra' },
  
  // 架构与数据 (新增/合并)
  { id: 'middleware_db', name: '数据库与中间件', description: 'MySQL(索引/锁/事务), Redis(架构/策略), Kafka, ZK', icon: 'Database', category: 'architecture' },
  { id: 'distributed_sys', name: '分布式与架构设计', description: 'CAP, 一致性 Hash, 负载均衡, 微服务, 高可用设计', icon: 'Share2', category: 'architecture' },
  
  // 工程化 (新增)
  { id: 'engineering', name: '工程与工具链', description: 'GDB 调试, Perf 性能分析, Docker/K8s, CMake, 内存泄漏检测', icon: 'Wrench', category: 'architecture' },
];
