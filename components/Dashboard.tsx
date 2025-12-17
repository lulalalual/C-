import React from 'react';
import { Button } from './Button';
import { QuizResult } from '../types';

interface DashboardProps {
  onBack: () => void;
  // In a real app, pass persistent history here
}

export const Dashboard: React.FC<DashboardProps> = ({ onBack }) => {
  // Mock data for visualization
  const skills = [
    { name: 'C++ 基础', level: 75 },
    { name: '多线程', level: 40 },
    { name: '网络编程', level: 60 },
    { name: 'Linux 内核', level: 30 },
    { name: '系统设计', level: 50 },
  ];

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-white">能力仪表盘</h2>
          <Button variant="secondary" onClick={onBack}>返回主页</Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Main Stat Cards */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">总练习题目</h3>
            <p className="text-4xl font-bold text-white mt-2">124</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">平均得分</h3>
            <p className="text-4xl font-bold text-indigo-400 mt-2">72.5</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-slate-400 text-sm font-medium">待攻克错题</h3>
            <p className="text-4xl font-bold text-red-400 mt-2">18</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skill Radar (Simulated with Bars) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">知识点掌握情况</h3>
            <div className="space-y-4">
              {skills.map(s => (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{s.name}</span>
                    <span className="text-slate-500">{s.level}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${s.level > 70 ? 'bg-emerald-500' : s.level > 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                      style={{ width: `${s.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Mistakes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6">错题本 / 重点复习</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-xs text-red-400 border border-red-500/30 px-1 rounded mr-2">C++ Core</span>
                  <span className="text-slate-300 text-sm">std::move 在 return 语句中的冗余使用</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">复习</button>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-xs text-red-400 border border-red-500/30 px-1 rounded mr-2">Network</span>
                  <span className="text-slate-300 text-sm">TCP TIME_WAIT 状态产生的具体原因</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">复习</button>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex justify-between items-center">
                <div>
                  <span className="text-xs text-red-400 border border-red-500/30 px-1 rounded mr-2">Linux</span>
                  <span className="text-slate-300 text-sm">Zombie Process 的危害与处理</span>
                </div>
                <button className="text-xs text-indigo-400 hover:text-indigo-300">复习</button>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full mt-6">查看所有错题</Button>
          </div>
        </div>
      </div>
    </div>
  );
};