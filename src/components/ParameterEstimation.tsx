import React, { useState, useEffect } from 'react';
import { LineChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useData } from '../contexts/DataContext';

// 分布类型接口
type DistributionType = 'normal' | 'exponential' | 'poisson' | 'uniform';

// 移除未使用的接口

const ParameterEstimation: React.FC = () => {
  const { data, analysisResult, parameterEstimationResult, setParameterEstimationResult, loading } = useData();
  const [selectedDistribution, setSelectedDistribution] = useState<DistributionType>('normal');
  const [estimationMethod, setEstimationMethod] = useState<'MLE' | 'MoM'>('MLE');
  const [fittedData, setFittedData] = useState<any[]>([]);

  // MLE估计函数
  const estimateMLE = (distribution: DistributionType): Record<string, number> => {
    if (data.length === 0 || !analysisResult) return {};

    const values = data.map(d => typeof d === 'number' ? d : d.value).map(val => Number(val));
    
    switch (distribution) {
      case 'normal':
        // 正态分布的MLE估计：均值和方差
        return {
          mean: analysisResult.mean,
          variance: values.reduce((sum, val) => sum + Math.pow(val - analysisResult.mean, 2), 0) / values.length,
          stdDev: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - analysisResult.mean, 2), 0) / values.length)
        };
      
      case 'exponential':
        // 指数分布的MLE估计：λ = 1/均值
        const lambda = 1 / analysisResult.mean;
        return {
          lambda,
          mean: analysisResult.mean
        };
      
      case 'poisson':
        // 泊松分布的MLE估计：λ = 均值
        return {
          lambda: analysisResult.mean
        };
      
      case 'uniform':
        // 均匀分布的MLE估计：a = min, b = max
        return {
          a: analysisResult.min,
          b: analysisResult.max,
          mean: (analysisResult.min + analysisResult.max) / 2,
          variance: Math.pow(analysisResult.max - analysisResult.min, 2) / 12
        };
      
      default:
        return {};
    }
  };

  // MoM估计函数
  const estimateMoM = (distribution: DistributionType): Record<string, number> => {
    if (data.length === 0 || !analysisResult) return {};

    const values: number[] = data.map(d => Number(typeof d === 'number' ? d : d.value));
    
    switch (distribution) {
      case 'normal':
        // 正态分布的MoM估计与MLE相同
        return {
          mean: analysisResult.mean,
          variance: values.reduce((sum, val) => sum + Math.pow(val - analysisResult.mean, 2), 0) / values.length,
          stdDev: Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - analysisResult.mean, 2), 0) / values.length)
        };
      
      case 'exponential':
        // 指数分布的MoM估计与MLE相同
        const lambda = 1 / analysisResult.mean;
        return {
          lambda,
          mean: analysisResult.mean
        };
      
      case 'poisson':
        // 泊松分布的MoM估计与MLE相同
        return {
          lambda: analysisResult.mean
        };
      
      case 'uniform':
        // 均匀分布的MoM估计
        const variance = values.reduce((sum, val) => sum + Math.pow(val - analysisResult.mean, 2), 0) / values.length;
        const range = Math.sqrt(12 * variance);
        return {
          a: analysisResult.mean - range / 2,
          b: analysisResult.mean + range / 2,
          mean: analysisResult.mean,
          variance
        };
      
      default:
        return {};
    }
  };

  // 计算对数似然函数
  const calculateLogLikelihood = (distribution: DistributionType, params: Record<string, number>): number => {
    if (data.length === 0) return 0;

    const values = data.map(d => d.value || d);
    let logLikelihood = 0;
    
    switch (distribution) {
      case 'normal': {
          const { mean, variance } = params;
          let result = 0;
          values.forEach(val => {
            const numVal = Number(val);
            result += -0.5 * Math.log(2 * Math.PI * variance) - Math.pow(numVal - mean, 2) / (2 * variance);
          });
          logLikelihood = result;
          break;
        }
        case 'exponential': {
          const lambda = params.lambda;
          let result = 0;
          values.forEach(val => {
            const numVal = Number(val);
            result += Math.log(lambda) - lambda * numVal;
          });
          logLikelihood = result;
          break;
        }
        case 'poisson': {
          const lambda_p = params.lambda;
          let result = 0;
          values.forEach(val => {
            const numVal = Number(val);
            result += numVal * Math.log(lambda_p) - lambda_p - factorial(numVal);
          });
          logLikelihood = result;
          break;
        }
      
      case 'uniform':
        const { a, b } = params;
        const range = b - a;
        if (range <= 0) return -Infinity;
        // 检查所有数据是否在[a, b]范围内
        const allInRange = values.every(val => (val as number) >= a && (val as number) <= b);
        if (!allInRange) return -Infinity;
        logLikelihood = -values.length * Math.log(range);
        break;
    }
    
    return logLikelihood;
  };

  // 计算AIC和BIC
  const calculateModelSelectionCriteria = (logLikelihood: number, paramCount: number): { aic: number; bic: number } => {
    const n = data.length;
    const aic = 2 * paramCount - 2 * logLikelihood;
    const bic = paramCount * Math.log(n) - 2 * logLikelihood;
    return { aic, bic };
  };

  // 阶乘函数（用于泊松分布）
  const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  };

  // 计算数据范围
  const calculateRange = (data: (number | {value: any})[]) => {
    if (data.length === 0) return { min: 0, max: 0 };
    const numValues: number[] = data.map(item => typeof item === 'number' ? item : Number(item.value));
    const min = Math.min(...numValues);
    const max = Math.max(...numValues);
    return { min, max };
  };

  // 生成拟合分布的数据
  const generateFittedData = (distribution: DistributionType, params: Record<string, number>) => {
    if (data.length === 0) return [];

    const { min, max } = calculateRange(data);
    const range = max - min;
    const padding = range * 0.1; // 添加10%的边距
    const start = min - padding;
    const end = max + padding;
    const step = (end - start) / 100;
    
    const fittedData = [];
    
    for (let x = start; x <= end; x += step) {
      let pdf = 0;
      
      switch (distribution) {
        case 'normal':
          const { mean, variance } = params;
          const stdDev = Math.sqrt(variance);
          pdf = (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mean) / stdDev, 2));
          break;
        
        case 'exponential':
          if (x >= 0) {
            pdf = params.lambda * Math.exp(-params.lambda * x);
          }
          break;
        
        case 'poisson':
          // 泊松分布是离散的，只在整数点有值
          if (Number.isInteger(x) && x >= 0) {
            const lambda = params.lambda;
            pdf = Math.pow(lambda, x) * Math.exp(-lambda) / factorial(x);
          }
          break;
        
        case 'uniform':
          const { a, b } = params;
          if (x >= a && x <= b) {
            pdf = 1 / (b - a);
          }
          break;
      }
      
      fittedData.push({ x, pdf });
    }
    
    return fittedData;
  };

  // 当选择的分布或方法改变时，重新计算估计结果
  useEffect(() => {
    if (data.length === 0 || !analysisResult) return;

    const mleParams = estimateMLE(selectedDistribution);
    const momParams = estimateMoM(selectedDistribution);
    const params = estimationMethod === 'MLE' ? mleParams : momParams;
    
    // 计算对数似然、AIC和BIC（仅对MLE）
    let logLikelihood: number | undefined;
    let aic: number | undefined;
    let bic: number | undefined;
    
    if (estimationMethod === 'MLE') {
      logLikelihood = calculateLogLikelihood(selectedDistribution, params);
      const paramCount = Object.keys(params).length;
      const criteria = calculateModelSelectionCriteria(logLikelihood, paramCount);
      aic = criteria.aic;
      bic = criteria.bic;
    }
    
    // 更新全局状态
      setParameterEstimationResult({
        distribution: selectedDistribution,
        method: estimationMethod.toLowerCase() as any,
        params: params,
        logLikelihood,
        aic,
        bic
      });
    setFittedData(generateFittedData(selectedDistribution, params));
  }, [selectedDistribution, estimationMethod, data, analysisResult]);

  // 生成直方图数据用于与拟合分布比较
  const generateHistogramData = () => {
    if (data.length === 0) return [];
    
    const values = data.map(d => typeof d === 'number' ? d : d.value) as number[];
    const sortedValues = [...values].sort((a, b) => a - b);
    const min = sortedValues[0];
    const max = sortedValues[sortedValues.length - 1];
    const range = max - min;
    const binCount = Math.max(5, Math.min(20, Math.ceil(Math.sqrt(data.length))));
    const binWidth = range / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      bin: i,
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      count: 0
    }));
    
    values.forEach(value => {
      const numValue = Number(value);
      if (numValue === max) {
        bins[binCount - 1].count++;
      } else {
        const binIndex = Math.floor((numValue - min) / binWidth);
        if (binIndex >= 0 && binIndex < binCount) {
          bins[binIndex].count++;
        }
      }
    });
    
    // 转换为密度
    const total = values.length * binWidth;
    return bins.map(bin => ({
      midpoint: (bin.start + bin.end) / 2,
      density: bin.count / total,
      count: bin.count
    }));
  };

  const histogramData = generateHistogramData();

  // 获取分布的中文名称
  const getDistributionName = (distribution: DistributionType): string => {
    const names = {
      normal: '正态分布',
      exponential: '指数分布',
      poisson: '泊松分布',
      uniform: '均匀分布'
    };
    return names[distribution];
  };

  // 格式化参数显示
  const formatParameter = (key: string, value: number): string => {
    switch (key) {
      case 'mean':
        return `均值 (μ): ${value.toFixed(6)}`;
      case 'stdDev':
        return `标准差 (σ): ${value.toFixed(6)}`;
      case 'variance':
        return `方差 (σ²): ${value.toFixed(6)}`;
      case 'lambda':
        return `λ: ${value.toFixed(6)}`;
      case 'a':
        return `下界 (a): ${value.toFixed(6)}`;
      case 'b':
        return `上界 (b): ${value.toFixed(6)}`;
      default:
        return `${key}: ${value.toFixed(6)}`;
    }
  };

  return (
    <div className="space-y-8 fade-in">
      {/* 标题和控制面板 */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
        <h2 className="text-2xl font-semibold text-primary">参数估计 (MLE/MoM)</h2>
        <p className="text-text-secondary">
          选择分布类型和估计方法，系统将自动计算最优参数估计值。参数估计基于样本数据的统计特性。
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-background border border-border-color rounded-lg p-5 flex flex-wrap gap-6 items-center justify-center">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label htmlFor="distribution" className="text-text-primary font-medium">选择分布类型:</label>
          <select
            id="distribution"
            value={selectedDistribution}
            onChange={(e) => setSelectedDistribution(e.target.value as DistributionType)}
            disabled={loading || data.length === 0}
            className="px-4 py-2 rounded-md border border-border-color focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-background"
          >
            <option value="normal">正态分布</option>
            <option value="exponential">指数分布</option>
            <option value="poisson">泊松分布</option>
            <option value="uniform">均匀分布</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <label className="text-text-primary font-medium">估计方法:</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="MLE"
                checked={estimationMethod === 'MLE'}
                onChange={() => setEstimationMethod('MLE')}
                disabled={loading || data.length === 0}
                className="text-primary focus:ring-primary"
              />
              <span>最大似然估计 (MLE)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                value="MoM"
                checked={estimationMethod === 'MoM'}
                onChange={() => setEstimationMethod('MoM')}
                disabled={loading || data.length === 0}
                className="text-primary focus:ring-primary"
              />
              <span>矩估计 (MoM)</span>
            </label>
          </div>
        </div>
      </div>

      {/* 估计结果 */}
      {parameterEstimationResult && (
        <div className="bg-background border border-border-color rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">
            {getDistributionName(selectedDistribution)} - {estimationMethod} 估计结果
          </h3>
          
          <div className="space-y-4">
            {/* 参数估计值 */}
            <div>
              <h4 className="text-base font-medium mb-3 text-text-primary">估计参数:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {parameterEstimationResult.params && Object.entries(parameterEstimationResult.params).map(([key, value]) => (
                  <div key={key} className="bg-secondary/5 border border-secondary/10 rounded-lg p-4">
                    <div className="text-sm text-text-secondary">{formatParameter(key, value as number).split(':')[0]}</div>
                    <div className="text-xl font-bold text-primary">{(value as number).toFixed(6)}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* 模型评估指标（仅MLE） */}
            {estimationMethod === 'MLE' && parameterEstimationResult?.logLikelihood !== undefined && (
              <div>
                <h4 className="text-base font-medium mb-3 text-text-primary">模型评估指标:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-4">
                    <div className="text-sm text-text-secondary">对数似然</div>
                    <div className="text-xl font-bold text-primary">{parameterEstimationResult.logLikelihood.toFixed(4)}</div>
                  </div>
                  {parameterEstimationResult.aic !== undefined && (
                    <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-4">
                      <div className="text-sm text-text-secondary">AIC</div>
                      <div className="text-xl font-bold text-primary">{parameterEstimationResult.aic.toFixed(4)}</div>
                    </div>
                  )}
                  {parameterEstimationResult.bic !== undefined && (
                    <div className="bg-secondary/5 border border-secondary/10 rounded-lg p-4">
                      <div className="text-sm text-text-secondary">BIC</div>
                      <div className="text-xl font-bold text-primary">{parameterEstimationResult.bic.toFixed(4)}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 拟合分布图表 */}
      {fittedData.length > 0 && histogramData.length > 0 && (
        <div className="bg-background border border-border-color rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">数据分布与拟合曲线</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={fittedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="x" 
                      label={{ value: 'X 值', position: 'insideBottomRight', offset: -10 }}
                    />
                    <YAxis 
                      label={{ value: '概率密度', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(6), '']}
                    />
                    <Legend />
                    {/* 直方图数据（用条形图表示） */}
                      <Bar 
                        dataKey="density" 
                        name="数据密度" 
                        fill="#94a3b8" 
                        opacity={0.6}
                      />
                {/* 拟合曲线 */}
                <Line 
                  type="monotone" 
                  dataKey="pdf" 
                  stroke="#3b82f6" 
                  strokeWidth={2} 
                  name={`${getDistributionName(selectedDistribution)}拟合`} 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* MLE vs MoM 比较（当数据足够时显示） */}
      {data.length > 10 && parameterEstimationResult && parameterEstimationResult?.params && (
        <div className="bg-background border border-border-color rounded-lg p-5">
          <h3 className="text-lg font-semibold mb-4 text-text-primary">MLE vs MoM 参数比较</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl overflow-hidden">
              <thead className="bg-neutral-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">参数</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">MLE 估计</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">MoM 估计</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">相对差异 (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {parameterEstimationResult.params && Object.keys(parameterEstimationResult.params).map((param) => {
                    const paramValue = parameterEstimationResult.params![param];
                    
                    return (
                      <tr key={param} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-800">
                          {formatParameter(param, paramValue).split(':')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          {paramValue.toFixed(6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          - (MoM 估计)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-700">
                          -% (相对差异)
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {data.length === 0 && (
        <div className="bg-background border border-border-color rounded-lg p-10 text-center">
          <p className="text-text-secondary">请先输入数据以查看参数估计结果</p>
        </div>
      )}
    </div>
  );
};

export default ParameterEstimation;