import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 分布类型
type DistributionType = 'normal' | 'exponential' | 'poisson' | 'uniform' | 'binomial';

// 分布参数接口
interface DistributionParams {
  mean?: number;
  stdDev?: number;
  lambda?: number;
  min?: number;
  max?: number;
  n?: number; // 二项分布的试验次数
  p?: number; // 二项分布的成功概率
}

const ProbabilityDistributions: React.FC = () => {
  const [distributionType, setDistributionType] = useState<DistributionType>('normal');
  const [params, setParams] = useState<DistributionParams>({
    mean: 0,
    stdDev: 1
  });
  const [showPDF, setShowPDF] = useState(true);
  const [showCDF, setShowCDF] = useState(false);
  const [chartData, setChartData] = useState<any[]>([]);

  // 更新参数
  const updateParam = (key: keyof DistributionParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 当分布类型改变时，重置参数
  useEffect(() => {
    switch (distributionType) {
      case 'normal':
        setParams({ mean: 0, stdDev: 1 });
        break;
      case 'exponential':
        setParams({ lambda: 1 });
        break;
      case 'poisson':
        setParams({ lambda: 3 });
        break;
      case 'uniform':
        setParams({ min: 0, max: 1 });
        break;
      case 'binomial':
        setParams({ n: 10, p: 0.5 });
        break;
    }
  }, [distributionType]);

  // 计算正态分布的PDF
  const normalPDF = (x: number, mean: number, stdDev: number): number => {
    const sqrt2pi = Math.sqrt(2 * Math.PI);
    const exponent = -Math.pow(x - mean, 2) / (2 * Math.pow(stdDev, 2));
    return Math.exp(exponent) / (stdDev * sqrt2pi);
  };

  // 计算正态分布的CDF
  const normalCDF = (x: number, mean: number, stdDev: number): number => {
    // 使用误差函数的近似计算
    const z = (x - mean) / stdDev;
    return 0.5 * (1 + erf(z / Math.sqrt(2)));
  };

  // 误差函数近似
  const erf = (x: number): number => {
    // 误差函数的有理近似
    const sign = x >= 0 ? 1 : -1;
    const absX = Math.abs(x);
    
    // 近似公式
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - ((a1 * t + a2 * t * t + a3 * t * t * t + a4 * t * t * t * t + a5 * t * t * t * t * t) * Math.exp(-absX * absX));
    
    return sign * y;
  };

  // 计算指数分布的PDF
  const exponentialPDF = (x: number, lambda: number): number => {
    if (x < 0) return 0;
    return lambda * Math.exp(-lambda * x);
  };

  // 计算指数分布的CDF
  const exponentialCDF = (x: number, lambda: number): number => {
    if (x < 0) return 0;
    return 1 - Math.exp(-lambda * x);
  };

  // 计算泊松分布的概率质量函数
  const poissonPMF = (k: number, lambda: number): number => {
    if (k < 0 || !Number.isInteger(k)) return 0;
    // 使用对数计算避免大数问题
    return Math.exp(k * Math.log(lambda) - lambda - factorialLn(k));
  };

  // 计算泊松分布的CDF
  const poissonCDF = (k: number, lambda: number): number => {
    let sum = 0;
    for (let i = 0; i <= Math.floor(k); i++) {
      sum += poissonPMF(i, lambda);
    }
    return sum;
  };

  // 计算均匀分布的PDF
  const uniformPDF = (x: number, min: number, max: number): number => {
    if (x < min || x > max) return 0;
    return 1 / (max - min);
  };

  // 计算均匀分布的CDF
  const uniformCDF = (x: number, min: number, max: number): number => {
    if (x < min) return 0;
    if (x > max) return 1;
    return (x - min) / (max - min);
  };

  // 计算二项分布的概率质量函数
  const binomialPMF = (k: number, n: number, p: number): number => {
    if (k < 0 || k > n || !Number.isInteger(k)) return 0;
    return binomialCoefficient(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  };

  // 计算二项分布的CDF
  const binomialCDF = (k: number, n: number, p: number): number => {
    let sum = 0;
    const maxK = Math.min(Math.floor(k), n);
    for (let i = 0; i <= maxK; i++) {
      sum += binomialPMF(i, n, p);
    }
    return sum;
  };

  // 计算二项式系数
  const binomialCoefficient = (n: number, k: number): number => {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k); // 利用对称性
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - k + i) / i;
    }
    return result;
  };

  // 计算阶乘的自然对数（用于泊松分布）
  const factorialLn = (n: number): number => {
    if (n === 0 || n === 1) return 0;
    let result = 0;
    for (let i = 2; i <= n; i++) {
      result += Math.log(i);
    }
    return result;
  };

  // 生成图表数据
  useEffect(() => {
    const generateData = () => {
      const data = [];
      
      switch (distributionType) {
        case 'normal':
          // 生成正态分布的x值范围
          const mean = params.mean || 0;
          const stdDev = params.stdDev || 1;
          const start = mean - 4 * stdDev;
          const end = mean + 4 * stdDev;
          const step = (end - start) / 100;
          
          for (let x = start; x <= end; x += step) {
            const point: any = { x: x.toFixed(2) };
            if (showPDF) {
              point.pdf = normalPDF(x, mean, stdDev);
            }
            if (showCDF) {
              point.cdf = normalCDF(x, mean, stdDev);
            }
            data.push(point);
          }
          break;
          
        case 'exponential':
          // 生成指数分布的x值范围
          const lambda = params.lambda || 1;
          const expStart = 0;
          const expEnd = 10 / lambda; // 覆盖大部分分布
          const expStep = (expEnd - expStart) / 100;
          
          for (let x = expStart; x <= expEnd; x += expStep) {
            const point: any = { x: x.toFixed(2) };
            if (showPDF) {
              point.pdf = exponentialPDF(x, lambda);
            }
            if (showCDF) {
              point.cdf = exponentialCDF(x, lambda);
            }
            data.push(point);
          }
          break;
          
        case 'poisson':
          // 生成泊松分布的k值
          const poisLambda = params.lambda || 3;
          const maxK = Math.ceil(poisLambda + 5 * Math.sqrt(poisLambda));
          
          for (let k = 0; k <= maxK; k++) {
            const point: any = { x: k.toString() };
            if (showPDF) {
              point.pdf = poissonPMF(k, poisLambda);
            }
            if (showCDF) {
              point.cdf = poissonCDF(k, poisLambda);
            }
            data.push(point);
          }
          break;
          
        case 'uniform':
          // 生成均匀分布的x值范围
          const min = params.min || 0;
          const max = params.max || 1;
          const uniStart = min - (max - min) * 0.2; // 添加20%边距
          const uniEnd = max + (max - min) * 0.2;
          const uniStep = (uniEnd - uniStart) / 100;
          
          for (let x = uniStart; x <= uniEnd; x += uniStep) {
            const point: any = { x: x.toFixed(2) };
            if (showPDF) {
              point.pdf = uniformPDF(x, min, max);
            }
            if (showCDF) {
              point.cdf = uniformCDF(x, min, max);
            }
            data.push(point);
          }
          break;
          
        case 'binomial':
          // 生成二项分布的k值
          const n = params.n || 10;
          const p = params.p || 0.5;
          
          for (let k = 0; k <= n; k++) {
            const point: any = { x: k.toString() };
            if (showPDF) {
              point.pdf = binomialPMF(k, n, p);
            }
            if (showCDF) {
              point.cdf = binomialCDF(k, n, p);
            }
            data.push(point);
          }
          break;
      }
      
      return data;
    };
    
    setChartData(generateData());
  }, [distributionType, params, showPDF, showCDF]);

  // 获取分布的中文名称
  const getDistributionName = (type: DistributionType): string => {
    const names = {
      normal: '正态分布',
      exponential: '指数分布',
      poisson: '泊松分布',
      uniform: '均匀分布',
      binomial: '二项分布'
    };
    return names[type];
  };

  // 渲染参数输入表单
  const renderParameterControls = () => {
    switch (distributionType) {
      case 'normal':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">均值 (μ)</label>
              <input
                type="number"
                value={params.mean || 0}
                onChange={(e) => updateParam('mean', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">标准差 (σ)</label>
              <input
                type="number"
                min="0.01"
                step="0.1"
                value={params.stdDev || 1}
                onChange={(e) => updateParam('stdDev', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
      
      case 'exponential':
      case 'poisson':
        return (
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              {distributionType === 'exponential' ? '率参数 (λ)' : '率参数 (λ)'}  
            </label>
            <input
              type="number"
              min="0.01"
              step="0.1"
              value={params.lambda || 1}
              onChange={(e) => updateParam('lambda', parseFloat(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );
      
      case 'uniform':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">最小值 (a)</label>
              <input
                type="number"
                value={params.min || 0}
                onChange={(e) => updateParam('min', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">最大值 (b)</label>
              <input
                type="number"
                value={params.max || 1}
                onChange={(e) => updateParam('max', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
      
      case 'binomial':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">试验次数 (n)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={params.n || 10}
                onChange={(e) => updateParam('n', parseInt(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">成功概率 (p)</label>
              <input
                type="number"
                min="0"
                max="1"
                step="0.01"
                value={params.p || 0.5}
                onChange={(e) => updateParam('p', parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-6">概率分布可视化</h3>
      
      {/* 分布类型选择器 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">选择分布类型</label>
        <select
          value={distributionType}
          onChange={(e) => setDistributionType(e.target.value as DistributionType)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="normal">正态分布</option>
          <option value="exponential">指数分布</option>
          <option value="poisson">泊松分布</option>
          <option value="uniform">均匀分布</option>
          <option value="binomial">二项分布</option>
        </select>
      </div>

      {/* 参数控制面板 */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <h4 className="font-medium mb-3">{getDistributionName(distributionType)} 参数</h4>
        {renderParameterControls()}
      </div>

      {/* 图表类型选择器 */}
      <div className="flex mb-6">
        <label className="inline-flex items-center mr-4">
          <input
            type="checkbox"
            checked={showPDF}
            onChange={(e) => setShowPDF(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">概率密度函数 (PDF)</span>
        </label>
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={showCDF}
            onChange={(e) => setShowCDF(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 text-sm text-gray-700">累积分布函数 (CDF)</span>
        </label>
      </div>

      {/* 图表容器 */}
      <div className="h-[400px] bg-white p-4 rounded-lg border border-gray-200">
        {chartData.length > 0 && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" label={{ value: 'x', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: '概率', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value: number) => value.toFixed(4)}
                labelFormatter={(label) => `x = ${label}`}
              />
              <Legend />
              {showPDF && <Line type="monotone" dataKey="pdf" stroke="#3b82f6" strokeWidth={2} name="PDF" />}
              {showCDF && <Line type="monotone" dataKey="cdf" stroke="#10b981" strokeWidth={2} name="CDF" />}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 分布信息说明 */}
      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium mb-2">分布说明</h4>
        <p className="text-sm text-gray-700">
          {distributionType === 'normal' && '正态分布是一种连续概率分布，由均值和标准差参数化，常用于自然现象建模。'}
          {distributionType === 'exponential' && '指数分布用于描述独立随机事件发生的时间间隔，由率参数λ控制。'}
          {distributionType === 'poisson' && '泊松分布描述在固定时间间隔内随机事件发生的次数，适用于稀有事件建模。'}
          {distributionType === 'uniform' && '均匀分布在区间[a,b]内所有值具有相等概率密度，是最简单的连续分布之一。'}
          {distributionType === 'binomial' && '二项分布描述n次独立伯努利试验中成功次数的离散概率分布，参数为成功概率p。'}
        </p>
      </div>
    </div>
  );
};

export default ProbabilityDistributions;