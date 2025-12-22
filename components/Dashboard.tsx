
import React, { useMemo, useState } from 'react';
import { Button } from './Button';
import { UserProfile, MistakeRecord, AVAILABLE_TOPICS } from '../types';

interface DashboardProps {
  onBack: () => void;
  user: UserProfile;
  onRemoveMistake: (id: string) => void;
}

// --- SVG Charts Components (Beautified) ---

const TrendChart = ({ history }: { history: UserProfile['history'] }) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const data = useMemo(() => {
    return history.slice(-10).map((h, i) => ({
      ...h,
      displayDate: h.date.split('T')[0].slice(5),
      index: i
    }));
  }, [history]);

  if (data.length < 2) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-500 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
        <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
        <span className="text-xs">完成至少两次面试以解锁趋势分析</span>
      </div>
    );
  }

  const width = 800;
  const height = 300;
  const padding = 40;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const xStep = graphWidth / (data.length - 1);
  const points = data.map((d, i) => {
    const x = padding + i * xStep;
    const y = padding + graphHeight - (d.score / 100) * graphHeight;
    return { x, y, ...d };
  });

  // Smooth curve (Bezier)
  const pathD = points.length === 0 ? "" : `M ${points[0].x},${points[0].y} ` + points.slice(1).map((p, i) => {
    // Simple smoothing strategy: Control points
    const prev = points[i];
    const midX = (prev.x + p.x) / 2;
    return `C ${midX},${prev.y} ${midX},${p.y} ${p.x},${p.y}`;
  }).join(' ');
  
  const areaD = `${pathD} L ${points[points.length - 1].x},${height - padding} L ${padding},${height - padding} Z`;

  return (
    <div className="relative w-full aspect-[21/9] bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 pointer-events-none"></div>
      <h3 className="absolute top-5 left-6 text-xs font-bold text-slate-400 uppercase tracking-widest z-10">能力成长趋势</h3>
      
      {hoverIndex !== null && (
        <div 
          className="absolute top-12 left-0 bg-slate-800/90 backdrop-blur text-xs text-white px-3 py-2 rounded-lg shadow-2xl border border-slate-700 pointer-events-none transform -translate-x-1/2 transition-all z-20 flex flex-col items-center"
          style={{ left: `${(points[hoverIndex].x / width) * 100}%` }}
        >
          <div className="font-bold text-indigo-400 text-lg leading-none">{points[hoverIndex].score}</div>
          <div className="text-[10px] text-slate-500 mt-1">{points[hoverIndex].displayDate}</div>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full filter drop-shadow-[0_0_10px_rgba(99,102,241,0.2)]">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
             <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
             <feMerge>
                 <feMergeNode in="coloredBlur"/>
                 <feMergeNode in="SourceGraphic"/>
             </feMerge>
           </filter>
        </defs>

        {/* Grid */}
        {[0, 25, 50, 75, 100].map(val => {
          const y = padding + graphHeight - (val / 100) * graphHeight;
          return (
            <g key={val}>
              <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#1e293b" strokeDasharray="4 4" strokeWidth="0.5" />
              <text x={padding - 10} y={y + 3} textAnchor="end" fontSize="10" fill="#475569" fontWeight="500">{val}</text>
            </g>
          );
        })}

        <path d={areaD} fill="url(#trendGradient)" />
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

        {points.map((p, i) => (
          <g key={i} onMouseEnter={() => setHoverIndex(i)} onMouseLeave={() => setHoverIndex(null)}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0f172a" stroke="#818cf8" strokeWidth="2" className="transition-all duration-300 hover:r-6 cursor-pointer" />
            <circle cx={p.x} cy={p.y} r="15" fill="transparent" className="cursor-pointer" />
          </g>
        ))}

        {points.map((p, i) => (
          <text key={i} x={p.x} y={height - 15} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="monospace">
            {p.displayDate}
          </text>
        ))}
      </svg>
    </div>
  );
};

const TopicMasteryChart = ({ history }: { history: UserProfile['history'] }) => {
  const masteryData = useMemo(() => {
    const topicScores: Record<string, { total: number; count: number }> = {};
    history.forEach(h => {
      h.topicIds.forEach(tid => {
        if (!topicScores[tid]) topicScores[tid] = { total: 0, count: 0 };
        topicScores[tid].total += h.score;
        topicScores[tid].count += 1;
      });
    });

    return Object.entries(topicScores)
      .map(([id, stats]) => {
        const topic = AVAILABLE_TOPICS.find(t => t.id === id);
        return {
          id,
          name: topic?.name || id,
          avg: Math.round(stats.total / stats.count),
          count: stats.count
        };
      })
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5); 
  }, [history]);

  if (masteryData.length === 0) return null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 shadow-xl h-full flex flex-col justify-center">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">强项分析 (Top 5)</h3>
      <div className="space-y-5">
        {masteryData.map((item, index) => (
          <div key={item.id} className="group relative">
            <div className="flex justify-between items-end mb-1.5 z-10 relative">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors flex items-center gap-2">
                <span className="w-4 text-center text-[10px] text-slate-600 font-mono">0{index + 1}</span>
                {item.name}
              </span>
              <span className={`text-xs font-bold font-mono ${item.avg >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {item.avg}%
              </span>
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800/50 relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                  item.avg >= 80 ? 'bg-emerald-500' : 
                  item.avg >= 60 ? 'bg-blue-500' : 
                  'bg-amber-500'
                }`} 
                style={{ width: `${item.avg}%` }} 
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Beautiful Mistake Card ---

const MistakeItem = React.memo(({ m, onRemove }: { m: MistakeRecord, onRemove: (id: string) => void }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="group relative bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-indigo-500/30 rounded-xl transition-all duration-300 overflow-hidden">
      {/* Decorative colored line on left */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${m.question.difficulty === '困难' ? 'bg-red-500' : m.question.difficulty === '中等' ? 'bg-amber-500' : 'bg-emerald-500'} opacity-60 group-hover:opacity-100 transition-opacity`}></div>
      
      <div className="p-5 pl-7">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              m.question.difficulty === '困难' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
              m.question.difficulty === '中等' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
              'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            }`}>
              {m.question.difficulty}
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-tight">{m.date.split('T')[0]}</span>
            {m.question.tags && m.question.tags[0] && (
               <span className="text-[10px] text-slate-500 border border-slate-800 px-1.5 rounded">{m.question.tags[0]}</span>
            )}
          </div>
          <button 
            onClick={() => onRemove(m.id)} 
            className="text-slate-600 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
            title="移除此题"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>

        <h4 className="text-base font-bold text-slate-200 mb-4 leading-snug cursor-pointer hover:text-indigo-400 transition-colors" onClick={() => setExpanded(!expanded)}>
          {m.question.text}
        </h4>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-sm transition-all duration-500 ${expanded ? 'opacity-100' : 'opacity-90'}`}>
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/20"></div>
            <span className="text-[10px] font-bold text-red-400 uppercase mb-2 block tracking-wider">你的回答</span>
            <p className={`text-slate-400 leading-relaxed ${!expanded && 'line-clamp-3'}`}>{m.userAnswer}</p>
          </div>
          <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800/50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500/20"></div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase mb-2 block tracking-wider">面试官点评 & 建议</span>
            <p className={`text-slate-400 leading-relaxed ${!expanded && 'line-clamp-3'}`}>{m.feedback}</p>
          </div>
        </div>
        
        <div className="mt-2 flex justify-center">
            <button onClick={() => setExpanded(!expanded)} className="text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors">
                {expanded ? '收起详情' : '展开详情'}
                <svg className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
        </div>
      </div>
    </div>
  );
});

// --- Main Dashboard Component ---

export const Dashboard: React.FC<DashboardProps> = ({ onBack, user, onRemoveMistake }) => {
  const stats = useMemo(() => {
    const total = user.history.length;
    const avg = total > 0 ? Math.round(user.history.reduce((a, c) => a + c.score, 0) / total) : 0;
    return { total, avg };
  }, [user.history]);

  return (
    <div className="min-h-screen bg-[#0B1120] py-10 px-4 sm:px-6">
       {/* Ambient Background */}
       <div className="fixed inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] opacity-30"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] opacity-20"></div>
       </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-10 flex items-center justify-between border-b border-slate-800/50 pb-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">能力画像</h2>
            <div className="flex items-center gap-2 mt-2">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <p className="text-slate-500 text-xs font-mono">USER: <span className="text-indigo-400">{user.username}</span></p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onBack} className="bg-slate-900 border-slate-700 text-slate-300 hover:text-white">
            返回主页
          </Button>
        </header>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: '实战模拟', value: stats.total, unit: '次', color: 'text-white' },
            { label: '综合均分', value: stats.avg, unit: '分', color: stats.avg >= 80 ? 'text-emerald-400' : stats.avg >= 60 ? 'text-amber-400' : 'text-red-400' },
            { label: '待复习错题', value: user.mistakes.length, unit: '题', color: user.mistakes.length > 0 ? 'text-red-400' : 'text-slate-400' }
          ].map((stat, i) => (
            <div key={i} className="bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-6 hover:bg-slate-800/60 transition-colors shadow-lg">
              <h3 className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{stat.label}</h3>
              <div className="flex items-baseline gap-2">
                <p className={`text-4xl font-bold ${stat.color} font-mono tracking-tighter`}>{stat.value}</p>
                <span className="text-xs text-slate-600">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>

        {/* 可视化图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 h-[320px]">
            <TrendChart history={user.history} />
          </div>
          <div className="lg:col-span-1 h-[320px]">
            <TopicMasteryChart history={user.history} />
          </div>
        </div>

        {/* 错题本区域 */}
        <div className="space-y-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-xl font-bold text-white">专项复习 (错题本)</h3>
           </div>
          
          {user.mistakes.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
              <p className="text-slate-400 font-medium">太棒了！目前没有错题记录。</p>
              <p className="text-xs text-slate-600 mt-2">在面试结果页点击“加入错题本”即可收藏需要巩固的知识点。</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
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
