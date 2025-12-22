
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

// 全面扩展的 C++ 后端知识图谱
export const AVAILABLE_TOPICS: Topic[] = [
  // --- Core: 语言与算法基础 ---
  { 
    id: 'cpp_basics_oop', 
    name: 'C++ 基础与 OOP', 
    description: '指针/引用区别, const/static 语义, 虚函数与 vptr/vtable 内存布局, 多态原理, 菱形继承, 构造/析构顺序', 
    icon: 'Code', 
    category: 'core' 
  },
  { 
    id: 'cpp_memory', 
    name: '内存管理与 RAII', 
    description: '堆栈区别, new/delete 原理, 智能指针(shared/unique/weak)实现与线程安全, 内存泄漏检测, 移动语义与完美转发', 
    icon: 'Cpu', 
    category: 'core' 
  },
  { 
    id: 'cpp_stl', 
    name: 'STL 源码剖析', 
    description: 'vector 扩容机制, map/unordered_map 红黑树与哈希表实现, 迭代器失效场景, 空间配置器(Allocator), 常用算法复杂度', 
    icon: 'Database', 
    category: 'core' 
  },
  { 
    id: 'cpp_modern', 
    name: 'C++11~23 新特性', 
    description: 'Lambda 表达式与闭包, 右值引用, auto/decltype, constexpr, 变参模板, Concept(C++20), Module, Range', 
    icon: 'Zap', 
    category: 'core' 
  },
  { 
    id: 'cpp_template', 
    name: '模板与泛型编程', 
    description: '模板特化/偏特化, SFINAE 机制, CRTP (奇异递归模板模式), Type Traits, 编译期计算', 
    icon: 'Code', 
    category: 'core' 
  },
  { 
    id: 'algo_structs', 
    name: '数据结构与算法', 
    description: 'B+/B-树, 跳表, LRU/LFU 实现, 堆排序/快排/归并原理, 图算法(Dijkstra/DFS/BFS), 字符串算法(KMP/Trie)', 
    icon: 'List', 
    category: 'core' 
  },

  // --- Infra: 底层系统与网络 ---
  { 
    id: 'os_kernel', 
    name: '操作系统原理', 
    description: '进程 vs 线程 vs 协程, 进程调度算法, 虚拟内存与缺页中断, 孤儿/僵尸进程, 死锁条件与预防', 
    icon: 'Terminal', 
    category: 'infra' 
  },
  { 
    id: 'linux_sys', 
    name: 'Linux 系统编程', 
    description: 'IPC (管道/共享内存/消息队列/信号), 文件描述符与 VFS, fork/exec, mmap 原理, 常用命令 (top/ps/netstat/awk)', 
    icon: 'HardDrive', 
    category: 'infra' 
  },
  { 
    id: 'network_protocol', 
    name: 'TCP/IP 协议栈', 
    description: '三次握手/四次挥手状态机, 滑动窗口与拥塞控制, TIME_WAIT/CLOSE_WAIT 分析, 粘包拆包, UDP 可靠传输, QUIC', 
    icon: 'Globe', 
    category: 'infra' 
  },
  { 
    id: 'network_io', 
    name: '高性能网络 IO', 
    description: 'BIO/NIO/AIO 区别, Select/Poll/Epoll 源码级原理 (LT/ET), Reactor 与 Proactor 模式, Zero-Copy (sendfile/splice)', 
    icon: 'Server', 
    category: 'infra' 
  },
  { 
    id: 'concurrency', 
    name: '多线程与并发', 
    description: 'Mutex/Condition Variable, 自旋锁, 读写锁, CAS 与原子操作, 内存序 (Memory Order) 与屏障, 伪共享 (False Sharing), 线程池实现', 
    icon: 'Activity', 
    category: 'infra' 
  },
  { 
    id: 'compile_debug', 
    name: '编译链接与调试', 
    description: 'ELF 文件格式, 静态链接 vs 动态链接, 符号表, GDB 调试技巧, Perf 性能分析, Valgrind 内存检测, CMake/Makefile', 
    icon: 'Wrench', 
    category: 'infra' 
  },

  // --- Architecture: 架构、中间件与工程 ---
  { 
    id: 'db_mysql', 
    name: 'MySQL 深入', 
    description: 'InnoDB 架构, 聚簇/非聚簇索引, 事务 ACID, 隔离级别与 MVCC, 锁机制 (行锁/间隙锁), 慢查询优化, Explain 分析', 
    icon: 'Database', 
    category: 'architecture' 
  },
  { 
    id: 'db_redis', 
    name: 'Redis 原理', 
    description: '底层数据结构 (SDS/Dict/Ziplist/Skiplist), 持久化 (RDB/AOF), 缓存雪崩/穿透/击穿, 哨兵与集群, 分布式锁实现', 
    icon: 'Layers', 
    category: 'architecture' 
  },
  { 
    id: 'distributed_theory', 
    name: '分布式理论', 
    description: 'CAP 定理, BASE 理论, 分布式一致性 (2PC/3PC/Paxos/Raft), Gossip 协议, 一致性 Hash, 唯一 ID 生成 (Snowflake)', 
    icon: 'Share2', 
    category: 'architecture' 
  },
  { 
    id: 'middleware_mq', 
    name: '消息队列与 RPC', 
    description: 'Kafka (高吞吐原理/零拷贝/ISR), RabbitMQ, 消息丢失与重复消费, 削峰填谷, gRPC/Protobuf 原理, 服务发现', 
    icon: 'MessageSquare', 
    category: 'architecture' 
  },
  { 
    id: 'system_design', 
    name: '系统设计与微服务', 
    description: '高并发架构, 负载均衡策略, 熔断/降级/限流, 异地多活, 秒杀系统设计, Feed 流设计, 短链接系统', 
    icon: 'Layout', 
    category: 'architecture' 
  },
  { 
    id: 'cloud_native', 
    name: '云原生与工程化', 
    description: 'Docker 原理 (Namespace/Cgroup/UnionFS), K8s 基础 (Pod/Service/Deployment), CI/CD, 单元测试, 代码规范', 
    icon: 'Cloud', 
    category: 'architecture' 
  }
];
