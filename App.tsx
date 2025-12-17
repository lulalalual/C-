import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopicSelection } from './components/TopicSelection';
import { QuizInterface } from './components/QuizInterface';
import { ResultsView } from './components/ResultsView';
import { SettingsModal } from './components/SettingsModal';
import { Dashboard } from './components/Dashboard';
import { AppState, Question, QuizResult, AIConfig, InterviewerStyle, UserProfile, MistakeRecord } from './types';
import { generateInterviewQuestions, analyzeInterviewPerformance } from './services/geminiService';
import { userService } from './services/userService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOGIN);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [style, setStyle] = useState<InterviewerStyle>('standard');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    const user = userService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setAppState(AppState.WELCOME);
    }
  }, []);

  const handleLogin = (u: string, p: string) => {
    if (userService.login(u, p)) {
      const user = userService.getCurrentUser();
      setCurrentUser(user);
      setAppState(AppState.WELCOME);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    userService.logout();
    setCurrentUser(null);
    setAppState(AppState.LOGIN);
  };

  const refreshUser = () => {
    const user = userService.getCurrentUser();
    setCurrentUser(user);
  };

  const handleSaveSettings = (config: AIConfig) => {
    userService.updateAIConfig(config);
    refreshUser();
  };

  const handleStart = () => {
    if (!currentUser?.aiConfig || !currentUser.aiConfig.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setAppState(AppState.SELECTION);
  };

  const handleTopicsSelected = async (selectedTopicIds: string[], resumeText?: string, selectedStyle: InterviewerStyle = 'standard') => {
    if (!currentUser?.aiConfig) return;
    
    setStyle(selectedStyle);
    setIsLoading(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(selectedTopicIds, currentUser.aiConfig, resumeText, selectedStyle);
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
    if (!currentUser?.aiConfig) return;

    setAppState(AppState.ANALYZING);
    setIsLoading(true); 
    try {
      const analysis = await analyzeInterviewPerformance(questions, answers, currentUser.aiConfig, style);
      
      // Save Stats
      userService.addHistory({
        date: new Date().toISOString(),
        score: analysis.overallScore,
        topicIds: questions.flatMap(q => q.tags) // Approximate topics by tags
      });
      refreshUser();

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

  const handleAddMistake = (mistake: MistakeRecord) => {
    userService.addMistake(mistake);
    refreshUser();
    alert("已加入错题本");
  };

  // Render Logic
  if (appState === AppState.LOGIN) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        currentConfig={currentUser?.aiConfig || null}
        onSave={handleSaveSettings}
      />

      <div className="fixed top-4 left-4 z-50 text-xs text-slate-500 font-mono">
        User: {currentUser?.username} | <button onClick={handleLogout} className="underline hover:text-white">Logout</button>
      </div>

      {appState === AppState.WELCOME && (
        <WelcomeScreen 
          onStart={handleStart} 
          onOpenSettings={() => setIsSettingsOpen(true)}
          hasConfig={!!currentUser?.aiConfig}
        />
      )}

      {appState === AppState.SELECTION && (
        <TopicSelection 
          onStartQuiz={handleTopicsSelected} 
          isLoading={isLoading} 
          onShowDashboard={() => setAppState(AppState.DASHBOARD)}
        />
      )}

      {appState === AppState.DASHBOARD && currentUser && (
        <Dashboard 
          user={currentUser} 
          onBack={() => setAppState(AppState.SELECTION)} 
          onRemoveMistake={(id) => { userService.removeMistake(id); refreshUser(); }}
        />
      )}

      {appState === AppState.QUIZ && currentUser?.aiConfig && (
        <QuizInterface questions={questions} onSubmit={handleQuizSubmit} isLoading={false} aiConfig={currentUser.aiConfig} />
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
        <ResultsView 
          result={results} 
          questions={questions}
          onRestart={handleRestart} 
          onAddMistake={handleAddMistake}
        />
      )}
    </div>
  );
};

export default App;