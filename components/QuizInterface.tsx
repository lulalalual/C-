import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { Button } from './Button';

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
  isLoading: boolean;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onSubmit, isLoading }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);

  const currentQ = questions[currentIdx];
  const progress = ((Object.keys(answers).length) / questions.length) * 100;

  const handleAnswerChange = (text: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: text
    }));
  };

  const handleNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  // Keyboard navigation for fun
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        if (currentIdx === questions.length - 1) handleSubmit();
        else handleNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIdx, answers]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      {/* Header / Progress */}
      <div className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between mb-2">
          <span className="text-slate-400 font-mono text-sm">题目 {currentIdx + 1} / {questions.length}</span>
          <span className="text-slate-400 font-mono text-sm">完成度 {Math.round(progress)}%</span>
        </div>
        <div className="max-w-4xl mx-auto h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-8 flex flex-col">
        {/* Question Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl mb-6">
          <div className="flex items-center gap-3 mb-6">
            <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider
              ${currentQ.difficulty === '困难' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                currentQ.difficulty === '中等' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              }`}>
              {currentQ.difficulty}
            </span>
            <span className="text-slate-500 text-sm font-medium px-2 py-1 bg-slate-800 rounded">
              {currentQ.category}
            </span>
          </div>

          <h2 className="text-xl md:text-2xl font-semibold text-slate-100 leading-relaxed mb-4">
            {currentQ.text}
          </h2>

          <div className="relative">
            <textarea
              className="w-full h-64 bg-slate-950 border border-slate-700 rounded-xl p-4 text-slate-300 font-mono text-base focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-shadow"
              placeholder="// 在此输入你的答案..."
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              autoFocus
            />
            <div className="absolute bottom-4 right-4 text-xs text-slate-600 font-mono">
              支持 Markdown
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-auto">
          <Button 
            variant="secondary" 
            onClick={handlePrev} 
            disabled={currentIdx === 0}
          >
            上一题
          </Button>
          
          <div className="flex gap-4">
            {currentIdx < questions.length - 1 ? (
              <Button onClick={handleNext}>
                下一题
              </Button>
            ) : (
              <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
                提交面试
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};