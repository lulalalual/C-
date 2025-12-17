import React, { useState, useRef } from 'react';
import { AVAILABLE_TOPICS, Topic, InterviewerStyle } from '../types';
import { Button } from './Button';
import * as pdfjsLib from 'pdfjs-dist';

// Handle ES module import structure for pdfjs-dist
const pdf = (pdfjsLib as any).default || pdfjsLib;

// Configure PDF worker
if (pdf.GlobalWorkerOptions) {
  pdf.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
}

interface TopicSelectionProps {
  onStartQuiz: (selectedIds: string[], resumeText?: string, style?: InterviewerStyle) => void;
  isLoading: boolean;
  onShowDashboard: () => void;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onStartQuiz, isLoading, onShowDashboard }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const [resumeText, setResumeText] = useState('');
  const [style, setStyle] = useState<InterviewerStyle>('standard');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleTopic = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const selectCategory = (cat: string) => {
    const ids = AVAILABLE_TOPICS.filter(t => t.category === cat).map(t => t.id);
    setSelected(prev => Array.from(new Set([...prev, ...ids])));
  };

  const handleStart = () => {
    if (selected.length > 0 || resumeText.trim().length > 0) {
      onStartQuiz(selected, resumeText, style);
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
        const maxPages = Math.min(pdfDoc.numPages, 3);
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        setResumeText(prev => prev + (prev ? '\n\n' : '') + fullText);
      } else {
        const text = await file.text();
        setResumeText(prev => prev + (prev ? '\n\n' : '') + text);
      }
    } catch (error) {
      console.error("File parse error:", error);
      alert("文件解析失败");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const categories = [
    { id: 'core', name: '语言核心', desc: 'STL, 现代 C++ 特性' },
    { id: 'system', name: '系统编程', desc: 'Linux, 网络, 多线程' },
    { id: 'advanced', name: '架构与调优', desc: '设计, 性能优化' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">定制你的模拟面试</h2>
            <p className="text-slate-400">配置考察范围、面试官风格，或上传简历进行针对性狙击。</p>
          </div>
          <Button variant="secondary" onClick={onShowDashboard} className="gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" /></svg>
            能力仪表盘
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          
          {/* LEFT: Topics (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {categories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-slate-200">{cat.name}</h3>
                  <button onClick={() => selectCategory(cat.id)} className="text-xs text-indigo-400 hover:text-indigo-300">
                    全选 {cat.desc}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AVAILABLE_TOPICS.filter(t => t.category === cat.id).map((topic) => (
                    <div 
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`
                        cursor-pointer rounded-xl p-4 border transition-all duration-200
                        ${selected.includes(topic.id) 
                          ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' 
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${selected.includes(topic.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {/* Simple icon placeholder */}
                          <span className="font-bold">{topic.name[0]}</span>
                        </div>
                        <div>
                          <h4 className={`font-medium ${selected.includes(topic.id) ? 'text-white' : 'text-slate-300'}`}>{topic.name}</h4>
                          <p className="text-xs text-slate-500 mt-1">{topic.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Style & Resume (4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Interviewer Style */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4">面试官风格</h3>
              <div className="space-y-3">
                {[
                  { id: 'standard', name: '标准大厂', desc: '客观、全面，注重基础与工程规范' },
                  { id: 'project_focused', name: '项目深挖', desc: '针对简历项目细节进行拷打' },
                  { id: 'deep_dive', name: '内核原理', desc: '死磕底层源码、OS 调度、内存模型' },
                  { id: 'stress', name: '压力测试', desc: '连续追问，考察边界情况与抗压能力' }
                ].map((s) => (
                  <label key={s.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="style" 
                      checked={style === s.id}
                      onChange={() => setStyle(s.id as InterviewerStyle)}
                      className="mt-1 text-indigo-500 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                    />
                    <div>
                      <div className="text-sm font-medium text-slate-200">{s.name}</div>
                      <div className="text-xs text-slate-500">{s.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Resume Upload */}
            <div className="flex flex-col h-[400px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">简历上传</h3>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded"
                >
                  {isParsing ? '解析中...' : '选择文件'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt,.md" onChange={handleFileUpload} />
              </div>
              
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="在此粘贴简历内容，或上传 PDF...&#10;AI 将提取技术栈并生成针对性问题。"
                className="flex-1 w-full bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 font-mono resize-none focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <Button 
              size="lg" 
              onClick={handleStart} 
              disabled={selected.length === 0 && !resumeText.trim()}
              isLoading={isLoading}
              className="w-full shadow-xl shadow-indigo-500/20"
            >
              {resumeText.trim() ? '基于简历生成面试' : '开始专项练习'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};