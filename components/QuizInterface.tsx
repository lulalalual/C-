
import React, { useState, useEffect, useCallback } from 'react';
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

  const handleNext = useCallback(() => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  }, [currentIdx, questions.length]);

  const handlePrev = useCallback(() => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  }, [currentIdx]);

  // 快捷键支持：Ctrl + Enter 提交或进入下一题
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'Enter') {
        if (currentIdx === questions.length - 1) {
          onSubmit(answers);
        } else {
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, answers, handleNext, onSubmit, questions.length]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-8 md:py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <div className="flex justify-between items-end mb-2">
            <h3 className="text-indigo-400 font-mono text-xs font-bold uppercase tracking-widest">
              面试进行中 — 问题 {currentIdx + 1} / {questions.length}
            </h3>
            <span className="text-slate-500 text-[10px] font-mono">CTRL + ENTER 快速前进</span>
          </div>
          <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-indigo-500 transition-all duration-300 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-6 shadow-xl transition-all duration-200">
          <div className="flex items-center gap-2 mb-6">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {currentQ.difficulty}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
              {currentQ.type === 'concept' ? '基础原理' : currentQ.type === 'design' ? '架构设计' : '场景分析'}
            </span>
          </div>
          
          <h2 className="text-xl md:text-2xl font-bold text-white leading-snug mb-8">
            {currentQ.text}
          </h2>

          <textarea
            autoFocus
            key={currentQ.id} // 切换题目时自动聚焦
            value={answers[currentQ.id] || ''}
            onChange={(e) => setAnswers(p => ({ ...p, [currentQ.id]: e.target.value }))}
            placeholder="请阐述你的理解、实现原理或设计方案..."
            className="w-full h-72 bg-slate-950 border border-slate-800 rounded-xl p-5 text-slate-200 placeholder-slate-800 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none text-base md:text-lg leading-relaxed shadow-inner"
          />
        </div>

        <div className="flex items-center justify-between gap-4">
          <Button 
            variant="outline" 
            onClick={handlePrev}
            disabled={currentIdx === 0}
            className="text-xs py-2"
          >
            上一题
          </Button>

          <div className="flex gap-3">
            {currentIdx === questions.length - 1 ? (
              <Button onClick={() => onSubmit(answers)} isLoading={isLoading} className="px-8 shadow-indigo-500/10">
                结束面试
              </Button>
            ) : (
              <Button onClick={handleNext} className="px-8">
                下一题
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
