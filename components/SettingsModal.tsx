
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

  useEffect(() => {
    if (isOpen && currentConfig) {
      setApiKey(currentConfig.apiKey);
    }
  }, [isOpen, currentConfig]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!apiKey.trim()) {
      alert("请输入有效的 API Key");
      return;
    }
    onSave({ provider: 'gemini', apiKey: apiKey.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white">配置 API</h2>
          </div>

          <p className="text-slate-400 text-sm mb-8 leading-relaxed">
            为了确保面试功能的正常运行，请输入你的 <span className="text-indigo-400 font-bold">Google Gemini API Key</span>。
            该 Key 将仅保存在你的本地浏览器数据库中，并用于与 AI 进行交互。
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                Gemini API Key
              </label>
              <input
                type="password"
                autoFocus
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="在此输入你的 sk-..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-4 text-white placeholder-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm transition-all"
              />
              <div className="mt-3 flex justify-between items-center">
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-400 hover:underline">
                  去获取免费 Key →
                </a>
                <span className="text-[10px] text-slate-600">AES-256 加密存储（模拟）</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/50 px-8 py-5 flex justify-end gap-3 border-t border-slate-800 rounded-b-2xl">
          <button onClick={onClose} className="text-sm text-slate-500 hover:text-slate-300 px-4">取消</button>
          <Button onClick={handleSave} className="px-8">
            确认并保存
          </Button>
        </div>
      </div>
    </div>
  );
};
