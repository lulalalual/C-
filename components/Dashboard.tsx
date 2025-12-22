
import React, { useMemo } from 'react';
import { Button } from './Button';
import { UserProfile, MistakeRecord } from '../types';

interface DashboardProps {
  onBack: () => void;
  user: UserProfile;
  onRemoveMistake: (id: string) => void;
}

const MistakeItem = React.memo(({ m, onRemove }: { m: MistakeRecord, onRemove: (id: string) => void }) => (
  <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg group hover:border-indigo-500/30 transition-all">
    <div className="flex justify-between items-start mb-2">
      <div className="flex items-center gap-2">
        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${m.question.difficulty === '困难' ? 'border-red-500/30 text-red-400' : 'border-amber-500/30 text-amber-400'}`}>
          {m.question.difficulty}
        </span>
        <span className="text-[10px] text-slate-500 font-mono">{m.date.split('T')[0]}</span>
      </div>
      <button onClick={() => onRemove(m.id)} className="text-slate-700 hover:text-red-400 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </div>
    <h4 className="text-sm md:text-base text-slate-200 font-medium mb-3">{m.question.text}</h4>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] md:text-xs">
      <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/30">
        <span className="text-red-400 font-bold block mb-1 opacity-70">你的回答</span>
        <p className="text-slate-400 line-clamp-3">{m.userAnswer}</p>
      </div>
      <div className="bg-slate-900/50 p-2.5 rounded border border-slate-800/30">
        <span className="text-emerald-400 font-bold block mb-1 opacity-70">面试官建议</span>
        <p className="text-slate-400 line-clamp-3">{m.feedback}</p>
      </div>
    </div>
  </div>
));

export const Dashboard: React.FC<DashboardProps> = ({ onBack, user, onRemoveMistake }) => {
  const stats = useMemo(() => {
    const total = user.history.length;
    const avg = total > 0 ? Math.round(user.history.reduce((a, c) => a + c.score, 0) / total) : 0;
    return { total, avg };
  }, [user.history]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 md:py-12 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">面试能力画像</h2>
            <p className="text-slate-500 text-xs mt-1">当前用户: <span className="text-indigo-400 font-mono">{user.username}</span></p>
          </div>
          <Button variant="outline" size="sm" onClick={onBack}>返回主页</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-slate-500 text-xs font-medium uppercase">面试场次</h3>
            <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-slate-500 text-xs font-medium uppercase">平均分</h3>
            <p className={`text-3xl font-bold mt-1 ${stats.avg >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>{stats.avg}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-slate-500 text-xs font-medium uppercase">记录错题</h3>
            <p className="text-3xl font-bold text-red-400 mt-1">{user.mistakes.length}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
            个人错题本
          </h3>
          
          {user.mistakes.length === 0 ? (
            <div className="text-center py-16 text-slate-600 bg-slate-950/30 rounded-xl border border-dashed border-slate-800">
              这里空空如也。点击面试报告中的“加入错题本”即可收藏。
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {user.mistakes.map(m => (
                <MistakeItem key={m.id} m={m} onRemove={onRemoveMistake} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
