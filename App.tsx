import React, { useState, useEffect } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopicSelection } from './components/TopicSelection';
import { QuizInterface } from './components/QuizInterface';
import { ResultsView } from './components/ResultsView';
import { SettingsModal } from './components/SettingsModal';
import { AppState, Question, QuizResult, AIConfig } from './types';
import { generateInterviewQuestions, analyzeInterviewPerformance } from './services/geminiService';

const AI_CONFIG_KEY = 'cpp_interview_ai_config';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Settings State
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load config on startup
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

  // Transition: Welcome -> Selection
  const handleStart = () => {
    if (!aiConfig || !aiConfig.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setAppState(AppState.SELECTION);
  };

  // Transition: Selection -> Quiz (fetch questions)
  const handleTopicsSelected = async (selectedTopicIds: string[], resumeText?: string) => {
    if (!aiConfig) return;
    
    setIsLoading(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(selectedTopicIds, aiConfig, resumeText);
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (error: any) {
      let msg = "生成题目失败。";
      if (error.message && error.message.includes("401")) {
        msg += " API Key 可能无效。";
        setIsSettingsOpen(true);
      } else {
        msg += " 请检查网络或配置。";
      }
      alert(msg);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transition: Quiz -> Results (analyze answers)
  const handleQuizSubmit = async (answers: Record<number, string>) => {
    if (!aiConfig) return;

    setAppState(AppState.ANALYZING);
    setIsLoading(true); 
    try {
      const analysis = await analyzeInterviewPerformance(questions, answers, aiConfig);
      setResults(analysis);
      setAppState(AppState.RESULTS);
    } catch (error) {
      alert("分析结果失败，请重试。");
      console.error(error);
      setAppState(AppState.QUIZ); // Go back to quiz to let them try submitting again
    } finally {
      setIsLoading(false);
    }
  };

  // Transition: Results -> Welcome (Reset)
  const handleRestart = () => {
    setQuestions([]);
    setResults(null);
    setAppState(AppState.WELCOME);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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
        <TopicSelection onStartQuiz={handleTopicsSelected} isLoading={isLoading} />
      )}

      {appState === AppState.QUIZ && (
        <QuizInterface questions={questions} onSubmit={handleQuizSubmit} isLoading={false} />
      )}

      {appState === AppState.ANALYZING && (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-4 text-center">
          <div className="w-24 h-24 mb-8 relative">
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">AI 正在阅卷中</h2>
          <p className="text-slate-400 max-w-md">
            我们严厉的 AI 面试官 ({aiConfig?.provider === 'deepseek' ? 'DeepSeek' : 'Gemini'}) 正在根据大厂标准分析你的代码逻辑...
          </p>
        </div>
      )}

      {appState === AppState.RESULTS && results && (
        <ResultsView result={results} onRestart={handleRestart} />
      )}
    </div>
  );
};

export default App;