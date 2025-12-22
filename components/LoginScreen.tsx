
import React, { useState } from 'react';
import { Button } from './Button';

interface LoginScreenProps {
  onLogin: (username: string, password: string) => boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Simulate a small delay for better UX feel
    await new Promise(resolve => setTimeout(resolve, 600));
    
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      setLoading(false);
      return;
    }

    const success = onLogin(username, password);
    if (!success) {
      setError('账号或密码错误');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center px-4 relative overflow-hidden font-sans">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
      </div>

      <div className="z-10 w-full max-w-[420px]">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-6 border border-white/10">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">欢迎回来</h1>
          <p className="text-slate-400">开启你的 C++ 后端进阶之旅</p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
          
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">用户名</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="developer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">密码</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3.5 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all font-mono text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 px-4 py-3 rounded-lg border border-red-500/20 animate-shake">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {error}
              </div>
            )}

            <Button type="submit" className="w-full text-base font-semibold shadow-blue-500/20 py-3.5" isLoading={loading}>
              进入系统
            </Button>
            
            <p className="text-center text-xs text-slate-500 mt-6 leading-relaxed">
              首次登录将自动创建账户 <br />
              <span className="opacity-60">数据仅存储于本地浏览器</span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};
