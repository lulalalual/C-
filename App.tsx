import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopicSelection } from './components/TopicSelection';
import { QuizInterface } from './components/QuizInterface';
import { ResultsView } from './components/ResultsView';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './components/Dashboard';
import { AppState, Question, QuizResult, AIConfig, InterviewerStyle } from './types';
import { generateInterviewQuestions, analyzeInterviewPerformance } from './services/geminiService';

const AI_CONFIG_KEY = 'cpp_interview_ai_config';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<InterviewerStyle>('standard');
  
  // Settings State
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(AI_CONFIG_KEY);
    if (saved) {
      try {
        setAiConfig(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved config");
      }
    }
  }, []);

  const handleSaveSettings = (config: AIConfig) => {
    setAiConfig(config);
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  };

  const handleStart = () => {
    if (!aiConfig || !aiConfig.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setAppState(AppState.SELECTION);
  };

  const handleTopicsSelected = async (selectedTopicIds: string[], resumeText?: string, selectedStyle: InterviewerStyle = 'standard') => {
    if (!aiConfig) return;
    
    setStyle(selectedStyle);
    setIsLoading(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(selectedTopicIds, aiConfig, resumeText, selectedStyle);
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (error: any) {
      let msg = "生成题目失败。";
      if (error.message && error.message.includes("401")) msg += " API Key 可能无效。";
      alert(msg);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuizSubmit = async (answers: Record<number, string>) => {
    if (!aiConfig) return;

    setAppState(AppState.ANALYZING);
    setIsLoading(true); 
    try {
      const analysis = await analyzeInterviewPerformance(questions, answers, aiConfig, style);
      setResults(analysis);
      setAppState(AppState.RESULTS);
    } catch (error) {
      alert("分析结果失败，请重试。");
      console.error(error);
      setAppState(AppState.QUIZ);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestart = () => {
    setQuestions([]);
    setResults(null);
    setAppState(AppState.WELCOME);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={aiConfig}
        onSave={handleSaveSettings}
      />

      {appState === AppState.WELCOME && (
        <WelcomeScreen 
          onStart={handleStart} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasConfig={!!aiConfig}
        />
      )}

      {appState === AppState.SELECTION && (
        <TopicSelection 
          onStartQuiz={handleTopicsSelected} 
          isLoading={isLoading} 
          onShowDashboard={() => setAppState(AppState.DASHBOARD)}
        />
      )}

      {appState === AppState.DASHBOARD && (
        <Dashboard onBack={() => setAppState(AppState.SELECTION)} />
      )}

      {appState === AppState.QUIZ && aiConfig && (
        <QuizInterface questions={questions} onSubmit={handleQuizSubmit} isLoading={false} aiConfig={aiConfig} />
      )}

      {appState === AppState.ANALYZING && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center font-mono text-xs text-indigo-400">
              Analyzing
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-3">AI 面试官阅卷中</h2>
          <div className="text-slate-400 max-w-md space-y-2 text-sm">
             <p>正在分析代码时间复杂度...</p>
             <p>正在检查内存泄漏风险...</p>
             <p>正在评估系统设计方案的可扩展性...</p>
          </div>
        </div>
      )}

      {appState === AppState.RESULTS && results && (
        <ResultsView result={results} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;