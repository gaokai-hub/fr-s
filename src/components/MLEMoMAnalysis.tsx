import React, { useState } from 'react';
import LineChart from './LineChart';

interface MLEMoMAnalysisProps {
  data: number[];
}

const MLEMoMAnalysis: React.FC<MLEMoMAnalysisProps> = ({ data }) => {
  const [selectedDistribution, setSelectedDistribution] = useState<string>('normal');

  // 计算正态分布参数
  const calculateNormalParameters = () => {
    if (data.length === 0) return [];

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    // 对于正态分布，MLE和MoM的结果相同
    return [
      {
        name: '均值 (μ)',
        value: mean,
        mle: mean,
        mom: mean,
        unit: ''
      },
      {
        name: '标准差 (σ)',
        value: stdDev,
        mle: stdDev,
        mom: stdDev,
        unit: ''
      }
    ];
  };

  // 计算指数分布参数
  const calculateExponentialParameters = () => {
    if (data.length === 0) return [];

    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    
    // MLE和MoM结果相同
    const lambda = 1 / mean;

    return [
      {
        name: '率参数 (λ)',
        value: lambda,
        mle: lambda,
        mom: lambda,
        unit: 'per unit'
      },
      {
        name: '均值 (1/λ)',
        value: mean,
        mle: mean,
        mom: mean,
        unit: ''
      }
    ];
  };

  // 计算均匀分布参数
  const calculateUniformParameters = () => {
    if (data.length === 0) return [];

    const min = Math.min(...data);
    const max = Math.max(...data);
    
    // MLE：使用样本的最小值和最大值
    // MoM：基于均值和方差估计
    const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const range = Math.sqrt(12 * variance);
    const aMom = mean - range / 2;
    const bMom = mean + range / 2;

    return [
      {
        name: '下限 (a)',
        value: min,
        mle: min,
        mom: aMom,
        unit: ''
      },
      {
        name: '上限 (b)',
        value: max,
        mle: max,
        mom: bMom,
        unit: ''
      },
      {
        name: '范围 (b-a)',
        value: max - min,
        mle: max - min,
        mom: range,
        unit: ''
      }
    ];
  };

  // 计算参数
  const getParameters = () => {
    switch (selectedDistribution) {
      case 'normal':
        return calculateNormalParameters();
      case 'exponential':
        return calculateExponentialParameters();
      case 'uniform':
        return calculateUniformParameters();
      default:
        return [];
    }
  };

  // 生成拟合数据用于可视化
  const generateFittedData = () => {
    if (data.length === 0) return [];
    
    const values = [...data].sort((a, b) => a - b);
    const params = getParameters();
    const points: {name: string, value: number, fitted?: number}[] = [];
    
    // 为每个数据点计算拟合值
    values.forEach((val) => {
      let fitted = 0;
      
      switch (selectedDistribution) {
        case 'normal':
          // 正态分布概率密度函数
          const mu = params.find(p => p.name.includes('均值'))?.mle || 0;
          const sigma = params.find(p => p.name.includes('标准差'))?.mle || 1;
          fitted = (1 / (sigma * Math.sqrt(2 * Math.PI))) * 
                  Math.exp(-0.5 * Math.pow((val - mu) / sigma, 2));
          break;
          
        case 'exponential':
          // 指数分布概率密度函数
          const lambda = params.find(p => p.name.includes('率参数'))?.mle || 1;
          fitted = lambda * Math.exp(-lambda * val);
          break;
          
        case 'uniform':
          // 均匀分布概率密度函数
          const a = params.find(p => p.name.includes('下限'))?.mle || 0;
          const b = params.find(p => p.name.includes('上限'))?.mle || 1;
          fitted = val >= a && val <= b ? 1 / (b - a) : 0;
          break;
      }
      
      points.push({
        name: val.toFixed(2),
        value: 0, // 原始数据
        fitted: fitted
      });
    });
    
    return points;
  };

  // 准备拟合数据用于折线图显示
  const prepareFittedChartData = () => {
    const fittedData = generateFittedData();
    return fittedData.map(point => ({
      name: point.name,
      value: point.fitted || 0
    }));
  };

  const parameters = getParameters();
  const fittedChartData = prepareFittedChartData();

  if (data.length === 0) {
    return (
      <div className="card p-8 fade-in">
        <div className="text-center py-12">
          <p className="text-text-secondary text-lg">请先输入数据以查看MLE/MoM分析结果</p>
        </div>
      </div>
    );
  }

  // 分布选项配置
  const distributionOptions = [
    { value: 'normal', label: '正态分布', icon: '🔔' },
    { value: 'exponential', label: '指数分布', icon: '📉' },
    { value: 'uniform', label: '均匀分布', icon: '📊' }
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* 分布选择器 */}
      <div className="card p-8 shadow-md">
        <h3 className="text-2xl font-bold mb-6 text-text-primary flex items-center gap-2">
          🔍 分布选择
        </h3>
        <div className="flex flex-wrap gap-4">
          {distributionOptions.map(option => (
            <button
              key={option.value}
              className={`relative px-6 py-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.03] hover:shadow-md ${selectedDistribution === option.value
                ? 'bg-primary text-white shadow-lg -translate-y-1'
                : 'bg-surface-secondary hover:bg-surface-tertiary text-text-secondary'}
              `}
              onClick={() => setSelectedDistribution(option.value)}
            >
              <span className="mr-2">{option.icon}</span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* 参数估计结果表格 */}
      <div className="card p-8 shadow-md">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">
          📈 参数估计结果 - {selectedDistribution === 'normal' ? '正态分布' : 
                        selectedDistribution === 'exponential' ? '指数分布' : '均匀分布'}
        </h3>
        <div className="overflow-x-auto rounded-xl shadow-sm">
          <table className="min-w-full bg-surface rounded-xl overflow-hidden">
            <thead className="bg-surface-secondary text-text-primary">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">参数</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">最大似然估计 (MLE)</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">矩估计 (MoM)</th>
                <th scope="col" className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">单位</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
              {parameters.map((param, index) => (
                <tr key={index} className="hover:bg-surface-secondary/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">{param.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary bg-gradient-to-r from-primary/5 to-transparent">
                    {(param.mle || 0).toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                    {(param.mom || 0).toFixed(6)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{param.unit || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 拟合分布可视化 */}
      <div className="chart-container card p-8 shadow-md">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">
          📊 拟合分布曲线
        </h3>
        <div className="h-[400px] bg-surface rounded-xl p-4 border border-border-color">
          <LineChart 
            data={fittedChartData} 
            title={`${selectedDistribution === 'normal' ? '正态分布' : 
                   selectedDistribution === 'exponential' ? '指数分布' : '均匀分布'}拟合曲线`} 
            color="var(--secondary-color)" 
          />
        </div>
      </div>

      {/* 分析解释 */}
      <div className="card p-8 bg-secondary/10 shadow-md">
        <h3 className="text-2xl font-bold mb-6 text-text-primary">
          📋 分析解释
        </h3>
        <div className="text-text-secondary space-y-6">
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-color transition-all duration-300 hover:shadow-md">
            <p className="font-semibold text-xl text-text-primary mb-3">
              🔍 最大似然估计 (MLE)
            </p>
            <p className="text-text-secondary leading-relaxed">
              寻找使观测数据出现概率最大的参数值。
              对于{getDistributionName(selectedDistribution)}，MLE估计值如表格所示。
            </p>
          </div>
          
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-color transition-all duration-300 hover:shadow-md">
            <p className="font-semibold text-xl text-text-primary mb-3">
              📏 矩估计 (MoM)
            </p>
            <p className="text-text-secondary leading-relaxed">
              通过匹配样本矩和理论矩来估计参数。
              对于{getDistributionName(selectedDistribution)}，矩估计结果如表格所示。
            </p>
          </div>
          
          <div className="p-6 bg-surface rounded-xl shadow-sm border border-border-color transition-all duration-300 hover:shadow-md">
            <p className="font-semibold text-xl text-text-primary mb-3">
              💡 模型选择建议
            </p>
            <p className="text-text-secondary leading-relaxed">
              选择适合您数据特征的分布模型。
              {selectedDistribution === 'normal' && ' 正态分布适合对称、钟形的数据分布。'}
              {selectedDistribution === 'exponential' && ' 指数分布适合描述时间间隔或衰减过程。'}
              {selectedDistribution === 'uniform' && ' 均匀分布适合数据在某个范围内均匀分布的情况。'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 辅助函数：获取分布名称
const getDistributionName = (distributionType: string): string => {
  switch (distributionType) {
    case 'normal': return '正态分布';
    case 'exponential': return '指数分布';
    case 'uniform': return '均匀分布';
    default: return '选择的分布';
  }
};

export default MLEMoMAnalysis;