import React, { useState } from 'react';
import BasicStatistics from './BasicStatistics';
import MLEMoMAnalysis from './MLEMoMAnalysis';
import ProbabilityDistribution from './ProbabilityDistribution';
import { useData } from '../contexts/DataContext';

const AnalysisTab: React.FC = () => {
  const { data } = useData();
  const [activeTab, setActiveTab] = useState<'basic' | 'mlemom' | 'distribution'>('basic');

  return (
    <div className="mt-8 fade-in space-y-6">
      {/* 标签切换 */}
      <div className="inline-flex p-1.5 bg-surface-secondary rounded-xl shadow-sm">
        <button
          type="button"
          className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${activeTab === 'basic' 
            ? 'bg-primary text-white shadow-lg -translate-y-1' 
            : 'bg-transparent hover:bg-surface-tertiary text-text-secondary'}`}
          onClick={() => setActiveTab('basic')}
        >
          📊 基本统计分析
        </button>
        <button
          type="button"
          className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${activeTab === 'mlemom' 
            ? 'bg-primary text-white shadow-lg -translate-y-1' 
            : 'bg-transparent hover:bg-surface-tertiary text-text-secondary'}`}
          onClick={() => setActiveTab('mlemom')}
        >
          📈 MLE-MoM分析
        </button>
        <button
          type="button"
          className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md ${activeTab === 'distribution' 
            ? 'bg-primary text-white shadow-lg -translate-y-1' 
            : 'bg-transparent hover:bg-surface-tertiary text-text-secondary'}`}
          onClick={() => setActiveTab('distribution')}
        >
          📉 概率分布可视化
        </button>
      </div>

      {/* 内容区域 */}
      <div className="card p-8 shadow-md">
        {/* 将{value: num}格式的数据转换为原始数值数组 */}
        {activeTab === 'basic' && <BasicStatistics />}
        {activeTab === 'mlemom' && <MLEMoMAnalysis data={(data || []).map(d => d.value)} />}
        {activeTab === 'distribution' && <ProbabilityDistribution />}
      </div>
    </div>
  );
};

export default AnalysisTab;