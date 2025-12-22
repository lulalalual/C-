import React from 'react';
import { QuizResult, Question, MistakeRecord } from '../types';
import { Button } from './Button';

interface ResultsViewProps {
  result: QuizResult;
  questions: Question[];
  onRestart: () => void;
  onAddMistake: (mistake: MistakeRecord) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, questions, onRestart, onAddMistake }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 from-emerald-400 to-teal-400';
    if (score >= 60) return 'text-amber-400 from-amber-400 to-orange-400';
    return 'text-red-400 from-red-400 to-pink-400';
  };

  const handleAddToMistakes = (qa: any) => {
    const question = questions.find(q => q.id === qa.questionId);
    if (!question) return;

    onAddMistake({
      id: Date.now().toString() + Math.random(),
      question,
      userAnswer: qa.userAnswer,
      feedback: qa.feedback,
      date: new Date().toISOString()
    });
  };

  return (
    <div className="min-h-screen bg-[#0B1120] py-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-white mb-2">面试评估报告</h2>
           <p className="text-slate-500">基于 DeepSeek 深度分析</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
           {/* Score Card */}
           <div className="lg:col-span-4 bg-slate-900/60 backdrop-blur-xl border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10 text-center">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">综合评分</div>
                <div className={`text-8xl font-black bg-clip-text text-transparent bg-gradient-to-br ${getScoreColor(result.overallScore)} drop-shadow-2xl`}>
                  {result.overallScore}
                </div>
                <div className="mt-6 inline-flex px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
                   击败了 85% 的候选人
                </div>
              </div>
           </div>

           {/* Feedback & Dimensions */}
           <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:col-span-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">综合点评</h3>
                 <p className="text-slate-300 leading-relaxed text-sm">{result.overallFeedback}</p>
              </div>
              
              <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:col-span-2">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">能力维度</h3>
                 <div className="space-y-4">
                    {Object.entries(result.dimensions).map(([key, val]) => {
                      const value = val as number;
                      return (
                      <div key={key} className="flex items-center gap-4">
                         <div className="w-16 text-xs font-bold text-slate-400 text-right uppercase">
                           {key === 'knowledge' ? '知识深度' : key === 'logic' ? '逻辑思维' : key === 'system' ? '系统设计' : '沟通表达'}
                         </div>
                         <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-amber-500' : 'bg-red-500'
                              }`} 
                              style={{ width: `${value}%` }} 
                            />
                         </div>
                         <div className="w-8 text-xs font-mono font-bold text-white text-right">{value}</div>
                      </div>
                    )})}
                 </div>
              </div>
           </div>
        </div>

        {/* Detailed Analysis */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 mb-2">
             <div className="h-px bg-slate-800 flex-1"></div>
             <h3 className="text-xl font-bold text-slate-400">逐题深度解析</h3>
             <div className="h-px bg-slate-800 flex-1"></div>
          </div>

          {result.questionAnalysis.map((item, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-slate-800/60 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
              <div className="p-6 border-b border-slate-800/60 flex flex-col md:flex-row gap-4 justify-between items-start bg-slate-800/20">
                <div className="flex-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700 mb-2">
                     Q{idx + 1}
                  </span>
                  <h4 className="text-lg font-bold text-slate-200 leading-snug">{item.questionText}</h4>
                </div>
                <div className={`text-2xl font-black px-4 ${item.score >= 80 ? 'text-emerald-400' : item.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                   {item.score}<span className="text-sm font-normal text-slate-600 ml-1">分</span>
                </div>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                   <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">你的回答</h5>
                   <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {item.userAnswer}
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">面试官点评</h5>
                      <p className="text-slate-300 text-sm leading-relaxed">{item.feedback}</p>
                   </div>
                   
                   <div className="space-y-2">
                      <h5 className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">参考答案</h5>
                      <div className="text-slate-400 text-sm leading-relaxed bg-slate-800/30 p-3 rounded-lg border border-slate-800/50">
                         {item.standardAnswer}
                      </div>
                   </div>

                   <div className="flex justify-end pt-2">
                      <Button variant="outline" size="sm" onClick={() => handleAddToMistakes(item)} className="text-xs">
                        加入错题本
                      </Button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center py-16">
          <Button size="lg" onClick={onRestart} className="px-12 shadow-2xl shadow-blue-500/10">返回主页</Button>
        </div>
      </div>
    </div>
  );
};