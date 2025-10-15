import { useState } from 'react';
import { DataProvider } from './contexts/DataContext';
import DataInputPanel from './components/DataInputPanel';
import BasicStatistics from './components/BasicStatistics';
import ParameterEstimation from './components/ParameterEstimation';
import ProbabilityDistributions from './components/ProbabilityDistributions';
import './style.css';

function App() {
  const [activeTab, setActiveTab] = useState<'statistics' | 'estimation' | 'distributions'>('statistics');

  return (
    <DataProvider>
      <div className="min-h-screen bg-background-light">
        {/* 应用头部 - 现代化设计 */}
        <header className="bg-background-card shadow-md rounded-b-xl border-b border-border-color mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="text-center text-3xl font-bold tracking-tight">统计数据分析工具</h1>
          </div>
        </header>

        {/* 主要内容区域 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-12">
          {/* 数据输入区域 - 增加卡片样式 */}
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-6">数据输入</h2>
            <div className="card p-6">
              <DataInputPanel />
            </div>
          </section>

          {/* 分析标签页 - 现代化设计 */}
          <section>
            <h2 className="text-2xl font-semibold mb-6">数据分析</h2>
            
            {/* 标签切换器 - 改进样式 */}
            <div className="mb-8">
              <div className="inline-flex p-1 bg-background-light rounded-xl border border-border-color flex-wrap">
                <button
                  onClick={() => setActiveTab('statistics')}
                  className={`px-5 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'statistics' ? 'bg-primary-color text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  基础统计分析
                </button>
                <button
                  onClick={() => setActiveTab('estimation')}
                  className={`px-5 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'estimation' ? 'bg-primary-color text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  MLE/MoM 参数估计
                </button>
                <button
                  onClick={() => setActiveTab('distributions')}
                  className={`px-5 py-3 rounded-lg font-medium text-sm transition-all ${activeTab === 'distributions' ? 'bg-primary-color text-white shadow-md' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  概率分布可视化
                </button>
              </div>
            </div>

            {/* 标签内容 - 使用卡片样式 */}
            <div className="card">
              {activeTab === 'statistics' && (
                <BasicStatistics />
              )}
              {activeTab === 'estimation' && (
                <ParameterEstimation />
              )}
              {activeTab === 'distributions' && (
                <ProbabilityDistributions />
              )}
            </div>
          </section>
        </main>

        {/* 页脚 - 现代化设计 */}
        <footer className="bg-background-card rounded-t-xl border-t border-border-color py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-text-secondary">
              © {new Date().getFullYear()} 统计数据分析工具 - 使用 React、TypeScript 和 Tailwind CSS 构建
            </p>
          </div>
        </footer>
      </div>
    </DataProvider>
  );
}

export default App;