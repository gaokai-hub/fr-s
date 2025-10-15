import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useDistribution } from '../hooks/useDistribution';

const ProbabilityDistribution: React.FC = () => {
  // 使用自定义hook管理分布状态和数据生成
  const {
    distributionType,
    setDistributionType,
    data,
    params,
    updateNormalParams,
    updateBinomialParams,
    updatePoissonParams,
    getCurrentDistributionName
  } = useDistribution();

  return (
    <div className="card p-8 shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-text-primary flex items-center">
        📈 概率分布可视化
      </h2>
      
      {/* 选择分布类型 */}
      <div className="mb-6">
        <label className="block text-text-secondary font-medium mb-2">选择分布类型：</label>
        <select 
          value={distributionType} 
          onChange={(e) => setDistributionType(e.target.value as 'normal' | 'binomial' | 'poisson')}
          className="w-full max-w-xs px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        >
          <option value="normal">正态分布</option>
          <option value="binomial">二项分布</option>
          <option value="poisson">泊松分布</option>
        </select>
      </div>

      {/* 分布参数控制 */}
      <div className="space-y-6">
        {distributionType === 'normal' && (
          <div className="space-y-4 bg-surface rounded-xl p-6">
            <h3 className="text-lg font-medium text-text-primary">正态分布参数</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-text-secondary font-medium w-32">均值 (μ): </label>
                <input 
                  type="number" 
                  value={params.normal.mean} 
                  onChange={(e) => updateNormalParams({ mean: parseFloat(e.target.value) })}
                  className="px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{width: '120px'}}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-text-secondary font-medium w-32">方差 (σ²): </label>
                <input 
                  type="number" 
                  value={params.normal.variance} 
                  onChange={(e) => updateNormalParams({ variance: parseFloat(e.target.value) })}
                  min="0.1" 
                  className="px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{width: '120px'}}
                />
              </div>
            </div>
          </div>
        )}

        {distributionType === 'binomial' && (
          <div className="space-y-4 bg-surface rounded-xl p-6">
            <h3 className="text-lg font-medium text-text-primary">二项分布参数</h3>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-text-secondary font-medium w-32">试验次数 (n): </label>
                <input 
                  type="number" 
                  value={params.binomial.n} 
                  onChange={(e) => updateBinomialParams({ n: parseInt(e.target.value) })}
                  min="1" 
                  className="px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{width: '120px'}}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <label className="text-text-secondary font-medium w-32">成功概率 (p): </label>
                <input 
                  type="number" 
                  value={params.binomial.p} 
                  onChange={(e) => updateBinomialParams({ p: parseFloat(e.target.value) })}
                  min="0" 
                  max="1" 
                  step="0.1"
                  className="px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  style={{width: '120px'}}
                />
              </div>
            </div>
          </div>
        )}

        {distributionType === 'poisson' && (
          <div className="space-y-4 bg-surface rounded-xl p-6">
            <h3 className="text-lg font-medium text-text-primary">泊松分布参数</h3>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <label className="text-text-secondary font-medium w-32">λ 参数: </label>
              <input 
                type="number" 
                value={params.poisson.lambda} 
                onChange={(e) => updatePoissonParams({ lambda: parseFloat(e.target.value) })}
                min="0.1" 
                className="px-4 py-3 bg-surface-secondary border border-border-color rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                style={{width: '120px'}}
              />
            </div>
          </div>
        )}
      </div>

      {/* 图表显示 */}
      <div className="mt-8 h-[400px] bg-surface rounded-xl p-4 border border-border-color">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.3} />
            <XAxis 
              dataKey="x" 
              label={{ value: 'X', position: 'insideBottomRight', offset: -10 }} 
              stroke="var(--text-secondary)"
            />
            <YAxis 
              label={{ value: '概率密度/质量', angle: -90, position: 'insideLeft' }} 
              stroke="var(--text-secondary)"
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="y" 
              name={getCurrentDistributionName()}
              stroke="var(--primary-color)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'var(--primary-color)' }}
              activeDot={{ r: 6, fill: 'var(--primary-color)', stroke: 'white', strokeWidth: 2 }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ProbabilityDistribution;