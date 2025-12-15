
export enum AppState {
  WELCOME = 'WELCOME',
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
}

export interface Question {
  id: number;
  category: string;
  text: string;
  difficulty: '简单' | '中等' | '困难';
}

export interface QuizResult {
  overallScore: number;
  overallFeedback: string;
  questionAnalysis: QuestionAnalysis[];
  learningPath: LearningStep[];
}

export interface QuestionAnalysis {
  questionId: number;
  questionText: string; // Repeated for context in display
  userAnswer: string;
  score: number; // 0-10
  feedback: string;
  standardAnswer: string;
}

export interface LearningStep {
  title: string;
  description: string;
  resources: string[];
}

export const AVAILABLE_TOPICS: Topic[] = [
  { id: 'cpp_lang', name: 'C++ 语言特性', description: 'STL, RAII, 智能指针, C++11/14/17/20 新特性', icon: 'Code' },
  { id: 'cpp_concurrency', name: 'C++ 多线程编程', description: '线程 (Thread), 互斥锁 (Mutex), 原子操作 (Atomic), 内存模型', icon: 'Cpu' },
  { id: 'cpp_net', name: 'C++ 网络编程', description: 'Socket API, IO 多路复用 (epoll/kqueue), Reactor/Proactor 模式', icon: 'Globe' },
  { id: 'linux_sys', name: 'Linux 系统编程', description: '进程与线程, IPC 通信, 信号处理, 文件系统', icon: 'Terminal' },
  { id: 'comp_net', name: '计算机网络', description: 'TCP/IP 协议栈, HTTP/HTTPS, 三次握手, 拥塞控制', icon: 'Wifi' },
  { id: 'os_core', name: '操作系统原理', description: '内存管理, 进程调度, 死锁, 虚拟内存', icon: 'Layers' },
];
