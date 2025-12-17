import React from 'react';
import { Button } from './Button';
import { UserProfile } from '../types';

interface DashboardProps {
  onBack: () => void;
  user: UserProfile;
  onRemoveMistake: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack, user, onRemoveMistake }) => {
  // Calculate Stats
  const totalAttempts = user.history.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(user.history.reduce((acc, curr) => acc + curr.score, 0) / totalAttempts) 
    : 0;
  
  const recentMistakes = user.mistakes;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white">能力仪表盘</h2>
            <p className="text-slate-400 text-sm mt-1">你好, <span className="text-indigo-400 font-mono">{user.username}</span></p>
          </div>
          <Button variant="secondary" onClick={onBack}>返回主页</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Stat Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">总练习次数</h3>
            <p className="text-4xl font-bold text-white mt-2">{totalAttempts}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">平均得分</h3>
            <p className={`text-4xl font-bold mt-2 ${avgScore >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {avgScore}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">待攻克错题</h3>
            <p className="text-4xl font-bold text-red-400 mt-2">{recentMistakes.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Mistake Book */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-red-500 rounded-full"></span>
              我的错题本 ({recentMistakes.length})
            </h3>
            
            {recentMistakes.length === 0 ? (
              <div className="text-center py-10 text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800 border-dashed">
                太棒了！目前没有记录的错题。
              </div>
            ) : (
              <div className="space-y-4">
                {recentMistakes.map(m => (
                  <div key={m.id} className="p-4 bg-slate-950 border border-slate-800 rounded-lg group hover:border-indigo-500/30 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border 
                          ${m.question.difficulty === '困难' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-400'}
                        `}>
                          {m.question.difficulty}
                        </span>
                        <span className="text-xs text-slate-500">{m.date.split('T')[0]}</span>
                      </div>
                      <button 
                        onClick={() => onRemoveMistake(m.id)}
                        className="text-slate-600 hover:text-red-400 transition-colors"
                        title="移出错题本"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    
                    <h4 className="text-base text-slate-200 font-medium mb-3">{m.question.text}</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-slate-900 p-3 rounded border border-slate-800/50">
                        <span className="text-xs text-red-400 font-bold block mb-1">你的回答</span>
                        <p className="text-slate-400 line-clamp-3 font-mono text-xs">{m.userAnswer}</p>
                      </div>
                      <div className="bg-slate-900 p-3 rounded border border-slate-800/50">
                        <span className="text-xs text-emerald-400 font-bold block mb-1">AI 建议</span>
                        <p className="text-slate-400 line-clamp-3 text-xs">{m.feedback}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};