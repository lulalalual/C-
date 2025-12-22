
import React, { useState, useRef } from 'react';
import { AVAILABLE_TOPICS, Topic, InterviewerStyle } from '../types';
import { Button } from './Button';
import * as pdfjsLib from 'pdfjs-dist';

const pdf = (pdfjsLib as any).default || pdfjsLib;
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
      alert("解析失败");
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const categories = [
    { id: 'core', name: 'C++ 语言核心', desc: '语法, STL' },
    { id: 'concurrency', name: '多线程并发', desc: '并发, 锁' },
    { id: 'system', name: 'Linux 系统编程', desc: 'OS, 网络' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">定制专项练习</h2>
            <p className="text-slate-400">选择你想挑战的 C++ 后端技术栈</p>
          </div>
          <Button variant="secondary" onClick={onShowDashboard} className="gap-2">
            能力仪表盘
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
          <div className="lg:col-span-8 space-y-8">
            {categories.map(cat => (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-4 border-l-4 border-indigo-500 pl-3">
                  <h3 className="text-xl font-semibold text-slate-200">{cat.name}</h3>
                  <button onClick={() => selectCategory(cat.id)} className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
                    全选 {cat.desc}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {AVAILABLE_TOPICS.filter(t => t.category === cat.id).map((topic) => (
                    <div 
                      key={topic.id}
                      onClick={() => toggleTopic(topic.id)}
                      className={`cursor-pointer rounded-xl p-5 border transition-all ${selected.includes(topic.id) ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500' : 'bg-slate-900/50 border-slate-800 hover:border-slate-600'}`}
                    >
                      <h4 className={`font-bold ${selected.includes(topic.id) ? 'text-white' : 'text-slate-300'}`}>{topic.name}</h4>
                      <p className="text-xs text-slate-500 mt-2">{topic.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">面试官风格</h3>
              <div className="space-y-2">
                {['standard', 'deep_dive', 'stress', 'project_focused'].map((s) => (
                  <label key={s} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors border border-transparent hover:border-slate-700">
                    <input type="radio" checked={style === s} onChange={() => setStyle(s as any)} className="text-indigo-500" />
                    <span className="text-sm text-slate-200 capitalize">{s.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">简历增强</h3>
                <button onClick={() => fileInputRef.current?.click()} className="text-[10px] bg-slate-800 text-slate-300 px-2 py-1 rounded hover:bg-slate-700">
                  {isParsing ? '解析中' : '上传 PDF'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.txt" onChange={handleFileUpload} />
              </div>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                placeholder="粘贴你的简历，AI 会针对性提问..."
                className="w-full h-40 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-400 font-mono resize-none focus:ring-1 focus:ring-indigo-500 outline-none"
              />
            </div>

            <Button size="lg" onClick={handleStart} disabled={selected.length === 0} isLoading={isLoading} className="w-full">
              开始模拟面试
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
