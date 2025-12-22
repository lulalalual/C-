
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
    if (score >= 80) return 'text-emerald-400';
    if (score >= 60) return 'text-amber-400';
    return 'text-red-400';
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
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl p-8 border border-slate-800">
            <h2 className="text-2xl font-bold text-white mb-2">面试评估报告</h2>
            <div className="flex items-baseline gap-4 mb-4">
              <span className={`text-6xl font-black ${getScoreColor(result.overallScore)}`}>{result.overallScore}</span>
              <span className="text-slate-500">综合得分</span>
            </div>
            <p className="text-slate-300 leading-relaxed bg-slate-950 p-6 rounded-xl border border-slate-800">
              {result.overallFeedback}
            </p>
          </div>
          
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">评估维度</h3>
            {Object.entries(result.dimensions).map(([key, value]) => (
              <div key={key}>
                <div className="flex justify-between text-xs mb-1 uppercase text-slate-400 font-bold">
                  <span>{key === 'knowledge' ? '知识深度' : key === 'logic' ? '逻辑严密' : key === 'system' ? '系统思维' : '沟通能力'}</span>
                  <span>{value}</span>
                </div>
                <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-indigo-500" style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h3 className="text-2xl font-bold text-white">逐题深度解析</h3>
          {result.questionAnalysis.map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-6 bg-slate-800/50 flex justify-between items-start border-b border-slate-800">
                <div className="flex-1">
                  <span className="text-xs font-mono text-indigo-400 mb-2 block">问题 {idx + 1}</span>
                  <h4 className="text-xl font-bold text-slate-100">{item.questionText}</h4>
                </div>
                <div className={`text-3xl font-black ml-4 ${getScoreColor(item.score * 10)}`}>{item.score}</div>
              </div>
              
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">你的回答</h5>
                  <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap bg-slate-950 p-4 rounded-lg border border-slate-800">{item.userAnswer}</div>
                </div>
                <div className="space-y-6">
                  <div>
                    <h5 className="text-xs font-bold text-amber-400 uppercase mb-3">面试官点评</h5>
                    <p className="text-slate-300 text-sm leading-relaxed">{item.feedback}</p>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-emerald-400 uppercase mb-3">参考思路</h5>
                    <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{item.standardAnswer}</p>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button 
                      onClick={() => handleAddToMistakes(item)}
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 border border-indigo-500/20 px-4 py-2 rounded-lg hover:bg-indigo-500/10 transition-all"
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

        <div className="flex justify-center py-12">
          <Button size="lg" onClick={onRestart} className="px-12">返回主页</Button>
        </div>
      </div>
    </div>
  );
};
