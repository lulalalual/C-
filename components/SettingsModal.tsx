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
  const [provider, setProvider] = useState<AIProvider>('deepseek');
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (currentConfig) {
        setProvider(currentConfig.provider);
        setApiKey(currentConfig.apiKey);
      } else {
        setProvider('deepseek');
        setApiKey(''); 
      }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">配置 AI 模型</h2>
          <p className="text-slate-400 text-sm mb-6">
            请选择您使用的 AI 提供商并输入相应的 API Key。此配置将保存到您的个人账户中。
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                选择模型提供商
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setProvider('deepseek')}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                    ${provider === 'deepseek' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                >
                  <span className="font-bold">DeepSeek</span>
                  <span className="text-[10px] opacity-70">DeepSeek-V3</span>
                </button>
                <button
                  onClick={() => setProvider('gemini')}
                  className={`py-3 px-4 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all
                    ${provider === 'gemini' 
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-800/80 hover:border-slate-600'
                    }`}
                >
                  <span className="font-bold">Google Gemini</span>
                  <span className="text-[10px] opacity-70">Gemini 2.5 Flash</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={`输入 ${provider === 'deepseek' ? 'DeepSeek' : 'Gemini'} API Key`}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-mono text-sm"
              />
              <p className="mt-2 text-xs text-slate-500">
                {provider === 'deepseek' 
                  ? 'DeepSeek Key 通常以 "sk-" 开头。' 
                  : 'Gemini Key 可以在 Google AI Studio 获取。'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 px-6 py-4 flex justify-end gap-3 border-t border-slate-800">
          <Button variant="secondary" onClick={onClose} size="sm">
            取消
          </Button>
          <Button onClick={handleSave} size="sm">
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
};