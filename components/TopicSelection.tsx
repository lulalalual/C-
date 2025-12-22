
import React, { useState, useRef } from 'react';
import { AVAILABLE_TOPICS, Topic, InterviewerStyle, QuestionDifficulty } from '../types';
import { Button } from './Button';
import * as pdfjsLib from 'pdfjs-dist';

const pdf = (pdfjsLib as any).default || pdfjsLib;
if (pdf.GlobalWorkerOptions) {
  pdf.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface TopicSelectionProps {
  onStartQuiz: (selectedIds: string[], count: number, difficulty: QuestionDifficulty, resumeText?: string, style?: InterviewerStyle) => void;
  isLoading: boolean;
  onShowDashboard: () => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onStartQuiz, isLoading, onShowDashboard }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  
  const [style, setStyle] = useState<InterviewerStyle>('standard');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);

  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTopic = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const selectCategory = (cat: string) => {
    const ids = AVAILABLE_TOPICS.filter(t => t.category === cat).map(t => t.id);
    const allSelected = ids.every(id => selected.includes(id));
    
    if (allSelected) {
       setSelected(prev => prev.filter(id => !ids.includes(id)));
    } else {
       setSelected(prev => Array.from(new Set([...prev, ...ids])));
    }
  };

  const handleStart = () => {
    if (selected.length > 0 || resumeText.trim().length > 0) {
      onStartQuiz(selected, questionCount, difficulty, resumeText, style);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsParsing(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        const loadingTask = pdf.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        let fullText = '';
        for (let i = 1; i <= Math.min(pdfDoc.numPages, 3); i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map((item: any) => item.str).join(' ') + '\n';
        }
        setResumeText(prev => (prev ? prev + '\n' : '') + fullText);
      } else {
        const text = await file.text();
        setResumeText(prev => (prev ? prev + '\n' : '') + text);
      }
    } catch (error) {
      alert("简历解析失败，请尝试复制粘贴文本。");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearResume = () => {
    setResumeText('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const categories = [
    { id: 'core', name: '语言核心', desc: 'C++ 深度与并发' },
    { id: 'infra', name: '底层原理', desc: 'OS 内核与网络' },
    { id: 'architecture', name: '架构工程', desc: '分布式与中间件' }
  ];

  const styleOptions = [
    { id: 'standard', label: '标准', desc: '大厂常规' },
    { id: 'deep_dive', label: '深挖', desc: '源码原理' },
    { id: 'stress', label: '压力', desc: '极限场景' },
    { id: 'project_focused', label: '实战', desc: '工程落地' },
  ];

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-200 font-sans selection:bg-blue-500/30 pb-20">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute top-[40%] left-[-20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[100px] opacity-30"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Navbar */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-white tracking-tight mb-1">
              面试配置
            </h2>
            <p className="text-slate-500 text-sm">定制你的专属技术挑战</p>
          </div>
          <Button variant="secondary" onClick={onShowDashboard} className="gap-2 pl-4 pr-5 rounded-full border-slate-700 hover:bg-slate-800">
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">
               📊
            </div>
            个人能力画像
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content: Topics */}
          <div className="lg:col-span-8 space-y-10">
            {categories.map(cat => {
              const catTopics = AVAILABLE_TOPICS.filter(t => t.category === cat.id);
              const isAllSelected = catTopics.every(t => selected.includes(t.id));

              return (
                <div key={cat.id} className="animate-fade-in-up">
                  <div className="flex items-end justify-between mb-5 px-1">
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-3">
                        {cat.name}
                        <span className="text-xs font-normal text-slate-500 px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-700/50">{cat.desc}</span>
                      </h3>
                    </div>
                    <button 
                      onClick={() => selectCategory(cat.id)} 
                      className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${isAllSelected ? 'bg-blue-500/10 text-blue-400' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'}`}
                    >
                      {isAllSelected ? '取消全选' : '本组全选'}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {catTopics.map((topic) => {
                      const isSelected = selected.includes(topic.id);
                      return (
                        <div 
                          key={topic.id}
                          onClick={() => toggleTopic(topic.id)}
                          className={`
                            relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 group overflow-hidden
                            ${isSelected 
                              ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.15)] scale-[1.02]' 
                              : 'bg-slate-900/40 border-slate-800/60 hover:border-slate-600 hover:bg-slate-800/60 hover:-translate-y-1'
                            }
                          `}
                        >
                          <div className={`absolute inset-0 bg-gradient-to-br ${isSelected ? 'from-blue-500/10 via-transparent to-transparent' : 'from-transparent to-transparent'} opacity-50`}></div>
                          
                          <div className="relative flex items-start gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold transition-colors ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-700'}`}>
                               {topic.id === 'cpp_core' ? 'C++' : topic.name[0]}
                            </div>
                            <div className="flex-1">
                              <h4 className={`font-bold text-base mb-1 transition-colors ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{topic.name}</h4>
                              <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 group-hover:text-slate-400 transition-colors">{topic.description}</p>
                            </div>
                            
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelected ? 'border-blue-500 bg-blue-500' : 'border-slate-700 bg-slate-900'}`}>
                              {isSelected && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Sidebar: Config */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-6 space-y-6">
              
              {/* Settings Panel */}
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

                {/* Resume Upload */}
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                     <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                       <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                       简历分析
                     </h3>
                     {resumeText && <button onClick={handleClearResume} className="text-[10px] text-red-400 hover:text-red-300">清除</button>}
                  </div>
                  
                  {!resumeText ? (
                    <div 
                      onClick={() => !isParsing && fileInputRef.current?.click()}
                      className={`group border-2 border-dashed border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-6 text-center transition-all cursor-pointer bg-slate-950/30 hover:bg-blue-900/10 ${isParsing ? 'cursor-wait opacity-50' : ''}`}
                    >
                      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} disabled={isParsing} />
                      {isParsing ? (
                         <div className="py-2"><div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div></div>
                      ) : (
                        <>
                          <div className="w-8 h-8 mx-auto mb-2 text-slate-500 group-hover:text-blue-400 transition-colors">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                          </div>
                          <p className="text-xs text-slate-400 font-medium group-hover:text-slate-300">点击上传简历 (PDF)</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex gap-3 items-center">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-emerald-200">简历已就绪</div>
                        <div className="text-[10px] text-emerald-400/60 truncate">定制化面试准备完毕</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Difficulty */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">题目难度</h3>
                  <div className="grid grid-cols-4 gap-1 bg-slate-950/50 p-1.5 rounded-xl border border-slate-800">
                    {[
                      { val: 'easy', label: '初级' },
                      { val: 'medium', label: '中级' },
                      { val: 'hard', label: '高级' },
                      { val: 'mixed', label: '混合' }
                    ].map(opt => (
                      <button
                        key={opt.val}
                        onClick={() => setDifficulty(opt.val as any)}
                        className={`py-2 rounded-lg text-[10px] font-bold transition-all ${
                          difficulty === opt.val 
                            ? 'bg-slate-800 text-white shadow-lg shadow-black/20' 
                            : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Count Slider */}
                <div className="mb-8">
                  <div className="flex justify-between items-end mb-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">题目数量</h3>
                    <div className="text-xl font-bold text-white font-mono">{questionCount}</div>
                  </div>
                  <div className="relative h-2 bg-slate-800 rounded-full">
                    <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full" style={{ width: `${((questionCount - 3) / 7) * 100}%` }}></div>
                    <input 
                      type="range" 
                      min="3" 
                      max="10" 
                      step="1"
                      value={questionCount}
                      onChange={(e) => setQuestionCount(Number(e.target.value))}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-blue-500 pointer-events-none transition-all" style={{ left: `calc(${((questionCount - 3) / 7) * 100}% - 8px)` }}></div>
                  </div>
                </div>

                {/* Style Selector */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">面试官风格</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {styleOptions.map((s) => (
                      <button 
                        key={s.id} 
                        onClick={() => setStyle(s.id as any)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                          style === s.id 
                            ? 'bg-blue-600/20 border-blue-500/50 text-white' 
                            : 'bg-slate-950/30 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900'
                        }`}
                      >
                        <span className="text-xs font-bold mb-0.5">{s.label}</span>
                        <span className="text-[9px] opacity-60">{s.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button 
                  size="lg" 
                  onClick={handleStart} 
                  disabled={selected.length === 0} 
                  isLoading={isLoading} 
                  className="w-full shadow-xl shadow-blue-600/20"
                >
                  {isLoading ? '生成面试中...' : '开始面试'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
