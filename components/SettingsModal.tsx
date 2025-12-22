
import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { AIConfig } from '../types';

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
      alert("请输入 DeepSeek API Key");
      return;
    }
    onSave({ apiKey: apiKey.trim() });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
        
        <div className="p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-blue-900/30 rounded-xl flex items-center justify-center border border-blue-500/20">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">API 配置</h2>
              <p className="text-xs text-slate-400 mt-0.5">DeepSeek V3 智能引擎</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                DeepSeek API Key
              </label>
              <input
                type="password"
                autoFocus
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-700 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none font-mono text-sm transition-all"
              />
            </div>
            
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                 Key 仅保存在本地浏览器中，用于直接请求 DeepSeek 官方接口。
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-950/30 px-8 py-4 flex justify-end gap-3 border-t border-slate-800/50">
          <Button variant="ghost" onClick={onClose} size="sm">取消</Button>
          <Button onClick={handleSave} size="sm" className="shadow-lg shadow-blue-500/20">
            保存连接
          </Button>
        </div>
      </div>
    </div>
  );
};
