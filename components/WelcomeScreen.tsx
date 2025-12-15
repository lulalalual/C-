import React from 'react';
import { Button } from './Button';

interface WelcomeScreenProps {
  onStart: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950">
      {/* Abstract Background Elements - Fixed to viewport */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[60px] md:blur-[100px]" />
        <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-purple-500/10 rounded-full blur-[40px] md:blur-[80px]" />
        
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      <div className="relative z-10 max-w-4xl px-6 py-12 text-center w-full">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs md:text-sm font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          AI 驱动的面试教练
        </div>

        <h1 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-6">
          征服 <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">C++ 后端</span> 面试
        </h1>
        
        <p className="text-base md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          备战腾讯、字节跳动等顶尖大厂，真题覆盖 Linux、网络编程和系统设计。即时 AI 评分，生成个性化学习路线。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full">
          <Button size="lg" onClick={onStart} className="w-full sm:w-auto px-10">
            开始模拟面试
          </Button>
          <button 
            onClick={onStart} 
            className="text-slate-400 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 cursor-pointer focus:outline-none w-full sm:w-auto py-2"
          >
            查看题库
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>

        {/* Decorate tags */}
        <div className="mt-12 md:mt-16 flex flex-wrap justify-center gap-2 md:gap-3 opacity-60">
          {['std::shared_ptr', 'epoll', 'TCP/IP', '虚拟内存', 'Mutex', 'B+ 树'].map(tag => (
            <span key={tag} className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded text-xs font-mono text-slate-300">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};