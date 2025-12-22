
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AIConfig, AIProvider } from '../types';

interface SettingsModalProps {
  currentConfig: AIConfig | null;
  onSave: (config: AIConfig) => void;
  onClose: () => void;
  isOpen: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ currentConfig, onSave, onClose, isOpen }) => {
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<AIProvider>('gemini');

  useEffect(() => {
    if (isOpen && currentConfig) {
      setApiKey(currentConfig.apiKey);
      setProvider(currentConfig.provider);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert("请输入有效的 API Key");
      return;
    }
    onSave({ provider, apiKey: apiKey.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${provider === 'gemini' ? 'bg-indigo-500/10' : 'bg-blue-500/10'}`}>
              <svg className={`w-6 h-6 ${provider === 'gemini' ? 'text-indigo-400' : 'text-blue-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">AI 引擎配置</h2>
          </div>

          <div className="space-y-6">
            {/* Provider Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                选择模型提供商
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setProvider('gemini')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    provider === 'gemini' 
                    ? 'bg-indigo-500/20 border-indigo-500 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-sm">Google Gemini</span>
                  <span className="text-[10px] opacity-70 mt-1">速度快 · 免费额度</span>
                </button>
                <button 
                  onClick={() => setProvider('deepseek')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    provider === 'deepseek' 
                    ? 'bg-blue-500/20 border-blue-500 text-white' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="font-bold text-sm">DeepSeek V3</span>
                  <span className="text-[10px] opacity-70 mt-1">推理强 · 中文优</span>
                </button>
              </div>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                {provider === 'gemini' ? 'Gemini API Key' : 'DeepSeek API Key'}
              </label>
              <input
                type="password"
                autoFocus
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={provider === 'gemini' ? "AIzaSy..." : "sk-..."}
                className={`w-full bg-slate-950 border rounded-xl px-4 py-4 text-white placeholder-slate-700 outline-none font-mono text-sm transition-all focus:ring-2 ${
                  provider === 'gemini' 
                  ? 'border-slate-800 focus:ring-indigo-500' 
                  : 'border-slate-800 focus:ring-blue-500'
                }`}
              />
              <div className="mt-3 flex justify-between items-center">
                <a 
                  href={provider === 'gemini' ? "https://aistudio.google.com/app/apikey" : "https://platform.deepseek.com/api_keys"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={`text-[10px] hover:underline ${provider === 'gemini' ? 'text-indigo-400' : 'text-blue-400'}`}
                >
                  {provider === 'gemini' ? '获取 Gemini Key →' : '获取 DeepSeek Key →'}
                </a>
                <span className="text-[10px] text-slate-600">Key 仅存储于本地浏览器</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-800">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300 px-4">取消</button>
          <Button onClick={handleSave} className={`px-8 ${provider === 'deepseek' ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/30' : ''}`}>
            确认连接
          </Button>
        </div>
      </div>
    </div>
  );
};
