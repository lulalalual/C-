import React, { useState, useRef } from 'react';
import { AVAILABLE_TOPICS, Topic } from '../types';
import { Button } from './Button';
import * as pdfjsLib from 'pdfjs-dist';

// Handle ES module import structure for pdfjs-dist
// In some environments, the library is on the 'default' property
const pdf = (pdfjsLib as any).default || pdfjsLib;

// Configure PDF worker
if (pdf.GlobalWorkerOptions) {
  pdf.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface TopicSelectionProps {
  onStartQuiz: (selectedIds: string[], resumeText?: string) => void;
  isLoading: boolean;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onStartQuiz, isLoading }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTopic = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    // Allow starting if topics are selected OR if a resume is provided (or both)
    if (selected.length > 0 || resumeText.trim().length > 0) {
      onStartQuiz(selected, resumeText);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    try {
      if (file.type === 'application/pdf') {
        const arrayBuffer = await file.arrayBuffer();
        
        // Use the resolved pdf object
        const loadingTask = pdf.getDocument({ data: arrayBuffer });
        const pdfDoc = await loadingTask.promise;
        
        let fullText = '';
        // Limit pages to 3 for performance in this demo env
        const maxPages = Math.min(pdfDoc.numPages, 3);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        if (pdfDoc.numPages > 3) {
          fullText += '\n[...剩余页面已省略...]';
        }
        
        setResumeText(prev => prev + (prev ? '\n\n' : '') + fullText);
      } else {
        // Assume text/plain or markdown
        const text = await file.text();
        setResumeText(prev => prev + (prev ? '\n\n' : '') + text);
      }
    } catch (error) {
      console.error("File parse error:", error);
      alert("文件解析失败。请尝试上传 .txt 文件或直接粘贴内容。");
    } finally {
      setIsParsing(false);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isStartDisabled = selected.length === 0 && resumeText.trim().length === 0;

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">选择你的战场</h2>
          <p className="text-slate-400">
            选择考察领域，或者上传/粘贴简历进行针对性模拟面试。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Topics Grid - Takes up 2 columns on large screens */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              1. 选择技术专题 (可选)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {AVAILABLE_TOPICS.map((topic) => (
                <div 
                  key={topic.id}
                  onClick={() => toggleTopic(topic.id)}
                  className={`
                    relative group cursor-pointer rounded-xl p-4 border transition-all duration-300
                    ${selected.includes(topic.id) 
                      ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-900/20' 
                      : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${selected.includes(topic.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                      <span className="font-bold text-base">{topic.name.charAt(0)}</span>
                    </div>
                    {selected.includes(topic.id) && (
                      <div className="text-indigo-400">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                      </div>
                    )}
                  </div>
                  <h3 className={`text-base font-semibold mb-1 ${selected.includes(topic.id) ? 'text-white' : 'text-slate-200'}`}>
                    {topic.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {topic.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Resume Input - Takes up 1 column */}
          <div className="lg:col-span-1 flex flex-col h-full">
            <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                2. 上传/粘贴简历
              </div>
              
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isParsing}
                className="text-xs flex items-center gap-1 bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 px-2 py-1 rounded border border-cyan-500/30 transition-colors"
              >
                {isParsing ? (
                  <>
                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    解析中...
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    上传简历
                  </>
                )}
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept=".pdf,.txt,.md"
                onChange={handleFileUpload}
              />
            </h3>
            
            <div className="flex-1 bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors flex flex-col relative group">
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="可以直接粘贴内容，或点击右上角按钮上传 PDF/TXT 简历...&#10;&#10;解析后的内容将显示在这里，您可以进行核对和修改。"
                className="w-full flex-1 bg-transparent text-slate-300 text-sm placeholder-slate-600 outline-none resize-none font-mono min-h-[300px]"
              />
              <div className="mt-2 flex justify-between items-center border-t border-slate-800/50 pt-2">
                <span className="text-xs text-slate-600">
                  支持 PDF, Markdown, TXT
                </span>
                <span className="text-xs text-slate-500">
                  {resumeText.length > 0 ? `${resumeText.length} 字符` : '空'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleStart} 
            disabled={isStartDisabled}
            isLoading={isLoading}
            className="w-full md:w-1/3 shadow-xl shadow-indigo-500/10"
          >
            {isLoading ? '正在生成面试题...' : 
              resumeText.trim() ? `基于简历开始面试` : `开始专项练习 (${selected.length} 项)`
            }
          </Button>
        </div>
      </div>
    </div>
  );
};