import React, { useState } from 'react';
import { WelcomeScreen } from './components/WelcomeScreen';
import { TopicSelection } from './components/TopicSelection';
import { QuizInterface } from './components/QuizInterface';
import { ResultsView } from './components/ResultsView';
import { AppState, Question, QuizResult } from './types';
import { generateInterviewQuestions, analyzeInterviewPerformance } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.WELCOME);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [results, setResults] = useState<QuizResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Transition: Welcome -> Selection
  const handleStart = () => {
    setAppState(AppState.SELECTION);
  };

  // Transition: Selection -> Quiz (fetch questions)
  const handleTopicsSelected = async (selectedTopicIds: string[]) => {
    setIsLoading(true);
    try {
      const generatedQuestions = await generateInterviewQuestions(selectedTopicIds);
      setQuestions(generatedQuestions);
      setAppState(AppState.QUIZ);
    } catch (error) {
      alert("生成题目失败。请检查 API Key 并重试。");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Transition: Quiz -> Results (analyze answers)
  const handleQuizSubmit = async (answers: Record<number, string>) => {
    setAppState(AppState.ANALYZING);
    setIsLoading(true); // Re-use loading state for UI indication inside Results view if needed, or specific loading component
    try {
      const analysis = await analyzeInterviewPerformance(questions, answers);
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

  // Render Logic
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {appState === AppState.WELCOME && (
        <WelcomeScreen onStart={handleStart} />
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
            我们严厉的 AI 面试官正在根据大厂标准分析你的代码逻辑、关键词覆盖和概念理解深度...
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