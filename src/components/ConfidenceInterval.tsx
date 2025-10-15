import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AnalysisResult {
  mean: number;
  stdDev: number;
  count: number;
}

interface ConfidenceIntervalProps {
  analysisResult: AnalysisResult | null;
}

/**
 * 置信区间组件
 * 
 * 置信区间是一个可能包含总体参数真实值的范围。
 * 例如，95%置信区间意味着如果我们重复抽样多次并计算置信区间，
 * 大约95%的区间会包含真实总体参数。
 */
const ConfidenceInterval: React.FC<ConfidenceIntervalProps> = ({ analysisResult }) => {
  // 默认置信水平为95%
  const [confidenceLevel, setConfidenceLevel] = useState<number>(95);
  
  // 置信水平对应的Z临界值表
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    98: 2.33,
    99: 2.576,
  };

  // 计算置信区间
  const confidenceInterval = useMemo(() => {
    if (!analysisResult || analysisResult.count < 30) return null;

    const zScore = zScores[confidenceLevel] || 1.96; // 默认使用95%的Z值
    const standardError = analysisResult.stdDev / Math.sqrt(analysisResult.count);
    const marginOfError = zScore * standardError;
    
    return {
      lower: analysisResult.mean - marginOfError,
      upper: analysisResult.mean + marginOfError,
      marginOfError
    };
  }, [analysisResult, confidenceLevel]);

  // 生成用于可视化的数据
  const chartData = useMemo(() => {
    if (!analysisResult || !confidenceInterval) return [];
    
    // 为了可视化，我们创建一个简单的图表数据
    const data = [];
    const start = analysisResult.mean - (confidenceInterval.upper - analysisResult.mean) * 1.5;
    const end = analysisResult.mean + (confidenceInterval.upper - analysisResult.mean) * 1.5;
    const step = (end - start) / 50;
    
    for (let x = start; x <= end; x += step) {
      // 简化的正态分布密度函数（仅用于可视化）
      const y = Math.exp(-0.5 * Math.pow((x - analysisResult.mean) / analysisResult.stdDev, 2));
      data.push({ x, y });
    }
    
    return data;
  }, [analysisResult, confidenceInterval]);

  if (!analysisResult) {
    return (
      <div className="text-center py-10">
        <p className="text-text-secondary">请先输入或生成数据以计算置信区间</p>
      </div>
    );
  }

  // 小样本警告
  const isSmallSample = analysisResult.count < 30;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">置信区间分析</h3>
      
      {/* 置信水平选择器 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-text-secondary mb-2">
          选择置信水平
        </label>
        <div className="flex space-x-2">
          {[90, 95, 98, 99].map((level) => (
            <button
              key={level}
              onClick={() => setConfidenceLevel(level)}
              className={`px-4 py-2 rounded-md text-sm transition-colors ${
                confidenceLevel === level
                  ? 'bg-primary-color text-white shadow-sm'
                  : 'bg-background-card text-text-secondary hover:bg-background-light'
              }`}
            >
              {level}%
            </button>
          ))}
        </div>
      </div>

      {/* 小样本警告 */}
      {isSmallSample && (
        <div className="p-4 bg-amber-50 text-amber-800 rounded-lg mb-6 border border-amber-200">
          <p className="text-sm">
            <strong>警告：</strong>您的数据样本量较小（n = {analysisResult.count}）。
            置信区间计算通常假设样本量足够大（n ≥ 30）。对于小样本，应使用t分布而非正态分布。
          </p>
        </div>
      )}

      {/* 置信区间结果 */}
      {confidenceInterval && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-background-card p-4 rounded-lg border border-border-color">
            <p className="text-sm text-text-secondary">置信下限</p>
            <p className="text-2xl font-semibold">{confidenceInterval.lower.toFixed(4)}</p>
          </div>
          <div className="bg-background-card p-4 rounded-lg border border-border-color">
            <p className="text-sm text-text-secondary">样本均值</p>
            <p className="text-2xl font-semibold">{analysisResult.mean.toFixed(4)}</p>
          </div>
          <div className="bg-background-card p-4 rounded-lg border border-border-color">
            <p className="text-sm text-text-secondary">置信上限</p>
            <p className="text-2xl font-semibold">{confidenceInterval.upper.toFixed(4)}</p>
          </div>
        </div>
      )}

      {/* 置信区间解释 */}
      <div className="bg-background-card p-5 rounded-lg border border-border-color mb-6">
        <h4 className="text-lg font-medium mb-2">解释</h4>
        <p className="text-text-secondary text-sm">
          {confidenceInterval
            ? `我们有${confidenceLevel}%的信心认为，真实总体均值位于${confidenceInterval.lower.toFixed(4)}和${confidenceInterval.upper.toFixed(4)}之间。
               这意味着如果我们重复抽样多次并计算${confidenceLevel}%置信区间，大约${confidenceLevel}%的区间会包含真实总体均值。`
            : '请增加样本量（至少30个数据点）以计算有效的置信区间。'}
        </p>
      </div>

      {/* 可视化图表 */}
      {confidenceInterval && chartData.length > 0 && (
        <div className="bg-background-card p-4 rounded-lg border border-border-color">
          <h4 className="text-lg font-medium mb-4">置信区间可视化</h4>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="x" label={{ value: '值', position: 'insideBottomRight', offset: -10 }} />
              <YAxis label={{ value: '概率密度', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value: number) => value.toFixed(4)} />
              <Line type="monotone" dataKey="y" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <ReferenceLine x={analysisResult.mean} stroke="#10b981" strokeDasharray="3 3" label={{ value: '样本均值', position: 'top' }} />
              <ReferenceLine x={confidenceInterval.lower} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '置信下限', position: 'top' }} />
              <ReferenceLine x={confidenceInterval.upper} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '置信上限', position: 'top' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default ConfidenceInterval;