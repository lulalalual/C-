import React, { useState } from 'react';
import { AVAILABLE_TOPICS, Topic } from '../types';
import { Button } from './Button';

interface TopicSelectionProps {
  onStartQuiz: (selectedIds: string[]) => void;
  isLoading: boolean;
}

export const TopicSelection: React.FC<TopicSelectionProps> = ({ onStartQuiz, isLoading }) => {
  const [selected, setSelected] = useState<string[]>([]);

  const toggleTopic = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleStart = () => {
    if (selected.length > 0) {
      onStartQuiz(selected);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">选择你的战场</h2>
          <p className="text-slate-400">选择你想挑战的领域，我们将为你生成针对性的面试题。</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AVAILABLE_TOPICS.map((topic) => (
            <div 
              key={topic.id}
              onClick={() => toggleTopic(topic.id)}
              className={`
                relative group cursor-pointer rounded-xl p-6 border transition-all duration-300
                ${selected.includes(topic.id) 
                  ? 'bg-indigo-900/20 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-900/20' 
                  : 'bg-slate-900/50 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'}
              `}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${selected.includes(topic.id) ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400 group-hover:text-white'}`}>
                  {/* Simple Icon placeholder logic */}
                  <span className="font-bold text-lg">{topic.name.charAt(0)}</span>
                </div>
                {selected.includes(topic.id) && (
                  <div className="text-indigo-400">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  </div>
                )}
              </div>
              <h3 className={`text-lg font-semibold mb-2 ${selected.includes(topic.id) ? 'text-white' : 'text-slate-200'}`}>
                {topic.name}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {topic.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleStart} 
            disabled={selected.length === 0}
            isLoading={isLoading}
            className="w-full md:w-1/3"
          >
            {isLoading ? '正在生成面试题...' : `开始面试 (已选 ${selected.length} 项)`}
          </Button>
        </div>
      </div>
    </div>
  );
};