import React, { useState, useEffect, useRef } from 'react';
import { Question, AIConfig } from '../types';
import { Button } from './Button';
import Prism from 'prismjs';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import { simulateCppExecution } from '../services/geminiService';

interface QuizInterfaceProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
  isLoading: boolean;
  aiConfig: AIConfig;
}

export const QuizInterface: React.FC<QuizInterfaceProps> = ({ questions, onSubmit, isLoading, aiConfig }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState<string>("// 点击 '运行代码' 查看输出...");
  const [isRunning, setIsRunning] = useState(false);
  
  const currentQ = questions[currentIdx];
  const isCodeQuestion = currentQ.type === 'code';

  // Prism Highlight logic
  const codeRef = useRef<HTMLPreElement>(null);
  
  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [answers, currentIdx, isCodeQuestion]);

  useEffect(() => {
    // Set initial code snippet if empty
    if (currentQ.codeSnippet && !answers[currentQ.id]) {
      setAnswers(prev => ({ ...prev, [currentQ.id]: currentQ.codeSnippet! }));
    }
  }, [currentQ, answers]);

  const handleAnswerChange = (text: string) => {
    setAnswers(prev => ({ ...prev, [currentQ.id]: text }));
  };

  const handleRunCode = async () => {
    if (!answers[currentQ.id]) return;
    setIsRunning(true);
    setConsoleOutput("Compiling with g++ -std=c++20 -O2 -Wall...\nRunning static analysis...");
    
    try {
      const result = await simulateCppExecution(answers[currentQ.id], currentQ.text, aiConfig);
      let output = "";
      if (!result.isCompilable) {
        output += `\x1b[31mCompilation Error:\x1b[0m\n${result.stderr}\n`;
      } else {
        output += `\x1b[32mBuild Success.\x1b[0m\n`;
        output += `\n[STDOUT]:\n${result.stdout}\n`;
        if (result.analysis) {
          output += `\n[AI Analysis]:\n${result.analysis}`;
        }
      }
      setConsoleOutput(output);
    } catch (e) {
      setConsoleOutput("Error communicating with simulation service.");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-screen bg-[#1e1e1e] flex flex-col overflow-hidden text-slate-300">
      
      {/* Top Bar */}
      <div className="h-12 bg-[#2d2d2d] border-b border-[#3e3e3e] flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-slate-100">C++ 面试终端</span>
          <div className="flex gap-1">
            {questions.map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full ${i === currentIdx ? 'bg-indigo-500' : answers[questions[i].id] ? 'bg-emerald-500' : 'bg-[#4e4e4e]'}`} 
              />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">{currentIdx + 1} / {questions.length}</span>
          <Button size="sm" variant="secondary" onClick={() => onSubmit(answers)} isLoading={isLoading}>
            交卷
          </Button>
        </div>
      </div>

      {/* Main Split Pane */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Problem Description */}
        <div className="w-full md:w-[40%] bg-[#252526] border-r border-[#3e3e3e] flex flex-col overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-2 py-0.5 text-xs rounded border 
                ${currentQ.difficulty === '困难' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 
                  currentQ.difficulty === '中等' ? 'border-amber-500/30 text-amber-400 bg-amber-500/10' : 
                  'border-emerald-500/30 text-emerald-400 bg-emerald-500/10'}`}>
                {currentQ.difficulty}
              </span>
              <span className="px-2 py-0.5 text-xs rounded border border-indigo-500/30 text-indigo-400 bg-indigo-500/10">
                {currentQ.type.toUpperCase()}
              </span>
              {currentQ.tags.map(tag => (
                <span key={tag} className="text-xs text-slate-500 font-mono">#{tag}</span>
              ))}
            </div>

            <h2 className="text-xl font-bold text-slate-100 mb-4">{currentQ.text}</h2>
            
            <div className="prose prose-invert prose-sm text-slate-400">
              <p>请在右侧编辑器中编写代码或输入答案。</p>
              {isCodeQuestion && (
                <ul className="list-disc pl-4 space-y-1 mt-2">
                  <li>注意内存管理 (RAII)</li>
                  <li>考虑异常安全性</li>
                  <li>使用现代 C++ 特性</li>
                </ul>
              )}
            </div>
          </div>
          
          <div className="mt-auto p-4 border-t border-[#3e3e3e] flex justify-between">
            <Button size="sm" variant="secondary" onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))} disabled={currentIdx === 0}>
              上一题
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCurrentIdx(Math.min(questions.length - 1, currentIdx + 1))} disabled={currentIdx === questions.length - 1}>
              下一题
            </Button>
          </div>
        </div>

        {/* Right: Editor / Answer Area */}
        <div className="flex-1 flex flex-col bg-[#1e1e1e] relative">
          
          {/* Editor Toolbar */}
          <div className="h-10 bg-[#2d2d2d] flex items-center justify-between px-4 border-b border-[#3e3e3e]">
            <span className="text-xs font-mono text-slate-400">solution.{isCodeQuestion ? 'cpp' : 'md'}</span>
            {isCodeQuestion && (
              <button 
                onClick={handleRunCode}
                disabled={isRunning}
                className="flex items-center gap-1 text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded transition-colors"
              >
                {isRunning ? (
                  <span className="animate-spin">⟳</span>
                ) : (
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/></svg>
                )}
                运行代码 (Simulated)
              </button>
            )}
          </div>

          {/* Editor Area */}
          <div className="flex-1 relative code-editor-wrapper">
            {/* Syntax Highlight Overlay */}
            <pre className="code-editor-highlight language-cpp" aria-hidden="true">
              <code ref={codeRef}>{answers[currentQ.id] || ''}</code>
            </pre>
            
            {/* Transparent Textarea for Input */}
            <textarea
              className="code-editor-textarea"
              value={answers[currentQ.id] || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              spellCheck={false}
              autoCapitalize="none"
              placeholder={isCodeQuestion ? "#include <iostream>\n..." : "在此输入你的答案..."}
            />
          </div>

          {/* Console Output (Collapsible) */}
          {isCodeQuestion && (
            <div className="h-1/3 bg-[#1e1e1e] border-t border-[#3e3e3e] flex flex-col">
              <div className="px-4 py-1 bg-[#252526] text-xs font-bold text-slate-400 border-b border-[#3e3e3e]">终端</div>
              <pre className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-auto whitespace-pre-wrap">
                {consoleOutput}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};