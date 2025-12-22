
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  
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
    if(textAreaRef.current) textAreaRef.current.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIdx, answers, handleNext, onSubmit, questions.length]);

  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col pt-6 pb-12 px-4 font-sans">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto w-full mb-8 flex justify-between items-center">
         <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 font-mono text-xs font-bold border border-slate-700">
               {currentIdx + 1}
            </div>
            <span className="text-slate-500 text-sm font-medium">/ {questions.length} 题</span>
         </div>
         <div className="hidden md:flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
           <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
           Ctrl + Enter 快速下一题
         </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        {/* Progress Bar */}
        <div className="h-1 w-full bg-slate-900 rounded-full mb-8 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="flex-1 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 shadow-2xl flex flex-col relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           
           <div className="mb-6">
             <div className="flex items-center gap-3 mb-4">
                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  currentQ.difficulty === '困难' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                  currentQ.difficulty === '中等' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                }`}>
                  {currentQ.difficulty}
                </span>
                <span className="text-slate-500 text-xs font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800">
                   {currentQ.tags && currentQ.tags[0]}
                </span>
             </div>
             <h2 className="text-2xl md:text-3xl font-bold text-slate-100 leading-tight">
               {currentQ.text}
             </h2>
           </div>

           <div className="flex-1 relative group">
             <textarea
               ref={textAreaRef}
               autoFocus
               key={currentQ.id}
               value={answers[currentQ.id] || ''}
               onChange={(e) => setAnswers(p => ({ ...p, [currentQ.id]: e.target.value }))}
               placeholder="> 在此输入你的回答..."
               className="w-full h-full bg-slate-950/50 border border-slate-800 rounded-xl p-6 text-slate-300 placeholder-slate-700 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 outline-none transition-all resize-none text-base md:text-lg font-mono leading-relaxed shadow-inner"
               spellCheck={false}
             />
             <div className="absolute bottom-4 right-4 text-xs text-slate-700 pointer-events-none font-mono">
                {answers[currentQ.id]?.length || 0} chars
             </div>
           </div>

           <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/5">
             <Button 
               variant="outline" 
               onClick={handlePrev}
               disabled={currentIdx === 0}
               className="border-slate-800 text-slate-500 hover:text-white hover:border-slate-600"
             >
               上一题
             </Button>
             
             {currentIdx === questions.length - 1 ? (
               <Button onClick={() => onSubmit(answers)} isLoading={isLoading} size="lg" className="shadow-xl shadow-blue-500/20">
                 提交面试
               </Button>
             ) : (
               <Button onClick={handleNext} size="lg">
                 下一题
                 <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
               </Button>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
