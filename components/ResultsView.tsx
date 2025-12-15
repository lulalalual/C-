import React from 'react';
import { QuizResult } from '../types';
import { Button } from './Button';

interface ResultsViewProps {
  result: QuizResult;
  onRestart: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, onRestart }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        
        {/* Header Summary */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2">面试分析报告</h2>
            <div className={`text-6xl font-black mb-4 ${getScoreColor(result.overallScore)}`}>
              {result.overallScore}
              <span className="text-2xl text-slate-500 font-medium">/100</span>
            </div>
            <p className="text-slate-300 max-w-2xl mx-auto leading-relaxed">
              {result.overallFeedback}
            </p>
          </div>
          {/* Background decoration */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-8 bg-indigo-500 rounded-full"></span>
            详细点评
          </h3>
          
          <div className="grid gap-6">
            {result.questionAnalysis.map((item, idx) => (
              <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
                <div className="p-6 border-b border-slate-800/50 flex justify-between items-start gap-4">
                  <div>
                    <span className="text-xs font-mono text-slate-500 mb-1 block">题目 {idx + 1}</span>
                    <h4 className="text-lg font-medium text-slate-200">{item.questionText}</h4>
                  </div>
                  <div className={`flex flex-col items-center px-3 py-1 rounded bg-slate-800 border border-slate-700 min-w-[60px]`}>
                    <span className={`text-xl font-bold ${getScoreColor(item.score * 10)}`}>{item.score}</span>
                    <span className="text-[10px] text-slate-500 uppercase">/ 10</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4 bg-slate-900/50">
                  <div>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">你的回答</h5>
                    <p className="text-slate-300 font-mono text-sm bg-slate-950 p-3 rounded border border-slate-800 whitespace-pre-wrap">
                      {item.userAnswer}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 mt-4">
                    <div>
                      <h5 className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-2">点评</h5>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.feedback}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-500/80 uppercase tracking-wider mb-2">参考答案</h5>
                      <p className="text-slate-400 text-sm leading-relaxed">{item.standardAnswer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Path */}
        <div>
          <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-8">
            <span className="w-1 h-8 bg-cyan-500 rounded-full"></span>
            推荐学习路径
          </h3>
          
          <div className="relative border-l-2 border-slate-800 ml-4 md:ml-6 space-y-8 pb-8">
            {result.learningPath.map((step, idx) => (
              <div key={idx} className="relative pl-8 md:pl-12">
                <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                  <h4 className="text-xl font-semibold text-white mb-2">{step.title}</h4>
                  <p className="text-slate-400 mb-4">{step.description}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {step.resources.map((res, rIdx) => (
                      <span key={rIdx} className="px-2 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded">
                        {res}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-8 pb-16">
          <Button size="lg" onClick={onRestart}>
            开始新的面试
          </Button>
        </div>

      </div>
    </div>
  );
};