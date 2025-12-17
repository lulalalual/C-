import React from 'react';
import { QuizResult, Question, MistakeRecord } from '../types';
import { Button } from './Button';

interface ResultsViewProps {
  result: QuizResult;
  questions: Question[]; // Need original questions to save full context
  onRestart: () => void;
  onAddMistake: (mistake: MistakeRecord) => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({ result, questions, onRestart, onAddMistake }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
  };

  const handleAddToMistakes = (qa: any) => {
    const question = questions.find(q => q.id === qa.questionId);
    if (!question) return;

    const mistake: MistakeRecord = {
      id: Date.now().toString() + Math.random().toString(),
      question: question,
      userAnswer: qa.userAnswer,
      feedback: qa.feedback,
      date: new Date().toISOString()
    };
    onAddMistake(mistake);
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Summary with Dimensions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-800 relative overflow-hidden">
             <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-2">面试评估报告</h2>
              <div className="flex items-baseline gap-4 mb-4">
                <span className={`text-6xl font-black ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
                <span className="text-slate-500">综合得分</span>
              </div>
              <p className="text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                {result.overallFeedback}
              </p>
            </div>
          </div>
          
          {/* Dimension Radar */}
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 flex flex-col justify-center space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">五维能力模型</h3>
            {Object.entries(result.dimensions).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1 uppercase text-slate-400 font-semibold">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className={`h-full rounded-full ${value >= 80 ? 'bg-emerald-500' : value >= 60 ? 'bg-indigo-500' : 'bg-red-500'}`} 
                    style={{ width: `${value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-1 h-8 bg-indigo-500 rounded-full"></span>
            深度解析
          </h3>
          
          <div className="grid gap-8">
            {result.questionAnalysis.map((item, idx) => (
              <div key={idx} className="bg-[#1e1e1e] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
                <div className="p-4 bg-[#252526] border-b border-[#3e3e3e] flex justify-between items-start">
                   <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-mono text-slate-500">Q{idx + 1}</span>
                        <span className="px-2 py-0.5 text-[10px] uppercase bg-slate-800 text-slate-400 rounded border border-slate-700">{item.questionType}</span>
                      </div>
                      <h4 className="text-lg font-medium text-slate-200">{item.questionText}</h4>
                   </div>
                   <div className={`text-2xl font-bold px-4 ${getScoreColor(item.score * 10)}`}>
                     {item.score}<span className="text-sm text-slate-600">/10</span>
                   </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2">
                  {/* Left: User Answer / Code */}
                  <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#3e3e3e] bg-[#1e1e1e]">
                    <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">你的回答/代码</h5>
                    <pre className="text-sm font-mono text-slate-300 whitespace-pre-wrap bg-[#111] p-4 rounded border border-[#333] overflow-x-auto">
                      {item.userAnswer}
                    </pre>
                    
                    {item.codeFeedback && (
                      <div className="mt-4 space-y-2">
                        <div className={`text-xs px-2 py-1 rounded inline-block ${item.codeFeedback.isCompilable ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                          {item.codeFeedback.isCompilable ? '编译通过' : '编译失败'}
                        </div>
                        {item.codeFeedback.efficiency && (
                          <p className="text-xs text-slate-500"><span className="text-slate-400">效率分析:</span> {item.codeFeedback.efficiency}</p>
                        )}
                        {item.codeFeedback.modernCppUsage && (
                          <p className="text-xs text-slate-500"><span className="text-slate-400">现代 C++ 建议:</span> {item.codeFeedback.modernCppUsage}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Right: Feedback */}
                  <div className="p-6 bg-[#202022]">
                    <div className="mb-6">
                      <h5 className="text-xs font-bold text-amber-500 uppercase mb-2">面试官点评</h5>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.feedback}</p>
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-emerald-500 uppercase mb-2">参考答案 / 优化思路</h5>
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-wrap">{item.standardAnswer}</p>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={() => handleAddToMistakes(item)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border border-indigo-500/30 px-3 py-1.5 rounded transition-all hover:bg-indigo-900/30"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                        加入错题本
                      </button>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.learningPath.map((step, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all">
                <div className="text-indigo-500 font-black text-4xl opacity-20 mb-2">0{idx + 1}</div>
                <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                <p className="text-sm text-slate-400 mb-4 h-10 line-clamp-2">{step.description}</p>
                <div className="flex flex-wrap gap-2">
                  {step.resources.map((res, rIdx) => (
                    <span key={rIdx} className="px-2 py-1 text-[10px] font-medium bg-slate-800 text-slate-300 rounded border border-slate-700">
                      {res}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center pt-8 pb-16">
          <Button size="lg" onClick={onRestart}>
            开始新的挑战
          </Button>
        </div>
      </div>
    </div>
  );
};