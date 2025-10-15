import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { useData } from '../contexts/DataContext';
import ConfidenceInterval from './ConfidenceInterval';

interface AnalysisResult {
  mean: number;
  median: number;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  skewness?: number;
  kurtosis?: number;
  quartile1?: number;
  quartile3?: number;
}

const BasicStatistics: React.FC = () => {
  const { data } = useData();
  const [localAnalysisResult, setLocalAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showHistogram, setShowHistogram] = useState(true);
  const [showLineChart, setShowLineChart] = useState(true);
  const [showQQPlot, setShowQQPlot] = useState(false);

  // 计算基本统计量
  const calculateStatistics = () => {
    if (data.length === 0) return null;

    const values = data.map(d => Number(typeof d === 'number' ? d : d.value)).filter(v => !isNaN(v));
    const count = values.length;
    const mean = Number(values.reduce((sum, val) => Number(sum) + Number(val), 0) / count);
    const sortedValues = [...values].sort((a, b) => Number(a) - Number(b));
    const median = Number(count % 2 === 0
      ? (Number(sortedValues[count / 2 - 1]) + Number(sortedValues[count / 2])) / 2
      : sortedValues[Math.floor(count / 2)]);
    const variance = Number(values.reduce((sum, val) => Number(sum) + Math.pow(Number(val) - mean, 2), 0) / count);
    const stdDev = Number(Math.sqrt(variance));
    const min = Number(sortedValues[0]);
    const max = Number(sortedValues[count - 1]);
    
    // 计算偏度和峰度
    const skewness = Number(values.reduce((sum, val) => Number(sum) + Math.pow((Number(val) - mean) / stdDev, 3), 0) / count);
    const kurtosis = Number(values.reduce((sum, val) => Number(sum) + Math.pow((Number(val) - mean) / stdDev, 4), 0) / count - 3);
    
    // 计算四分位数
    const quartile1 = Number(sortedValues[Math.floor(count * 0.25)]);
    const quartile3 = Number(sortedValues[Math.floor(count * 0.75)]);
    
    const result = {
        mean,
        median,
        variance,
        stdDev,
        min,
        max,
        count,
        skewness,
        kurtosis,
        quartile1,
        quartile3,
        mode: Number(values[0]), // 添加mode属性
        range: max - min, // 添加range属性
        q1: quartile1, // 添加q1属性
        q3: quartile3, // 添加q3属性
        iqr: quartile3 - quartile1 // 添加iqr属性
      };
      
      setLocalAnalysisResult(result);
    return result;
  };

  // 生成直方图数据
  const generateHistogramData = () => {
    if (data.length === 0) return [];
    
    const values = data.map(d => Number(typeof d === 'number' ? d : d.value)).filter(v => !isNaN(v));
    const sortedValues = [...values].sort((a, b) => Number(a) - Number(b));
    const min = Number(sortedValues[0]);
    const max = Number(sortedValues[sortedValues.length - 1]);
    const range = max - min;
    const binCount = Math.max(5, Math.min(20, Math.ceil(Math.sqrt(data.length)))); // 限制分箱数在5-20之间
    const binWidth = range / binCount;
    
    const bins = Array(binCount).fill(0).map((_, i) => ({
      bin: i,
      start: min + i * binWidth,
      end: min + (i + 1) * binWidth,
      count: 0
    }));
    
    values.forEach(value => {
      const numValue = Number(value);
      // 处理边界情况
      if (numValue === max) {
        bins[binCount - 1].count++;
      } else {
        const binIndex = Math.floor((numValue - min) / binWidth);
        if (binIndex >= 0 && binIndex < binCount) {
          bins[binIndex].count++;
        }
      }
    });
    
    return bins.map(bin => ({
      name: `${bin.start.toFixed(2)}-${bin.end.toFixed(2)}`,
      count: bin.count
    }));
  };

  // 生成线图数据（排序后的值）
  const generateLineChartData = () => {
    if (data.length === 0) return [];
    
    const values = data.map(d => Number(typeof d === 'number' ? d : d.value)).filter(v => !isNaN(v));
    const sortedValues = [...values].sort((a, b) => Number(a) - Number(b));
    return sortedValues.map((value, index) => ({
      name: (index + 1).toString(),
      value: Number(value)
    }));
  };

  // 生成QQ图数据
  const generateQQPlotData = () => {
    if (data.length === 0 || !localAnalysisResult) return [];
    
    const values = data.map(d => Number(typeof d === 'number' ? d : d.value)).filter(v => !isNaN(v));
    const sortedValues = [...values].sort((a, b) => Number(a) - Number(b));
    const mean = Number(localAnalysisResult.mean);
    const stdDev = Number(localAnalysisResult.stdDev);
    
    return sortedValues.map((value, index) => {
      // 计算理论分位数
      const p = (index + 0.5) / sortedValues.length;
      // 近似的逆正态分布函数
      const zScore = p < 0.5 
        ? -Math.sqrt(-2 * Math.log(p))
        : Math.sqrt(-2 * Math.log(1 - p));
      
      return {
        theoretical: mean + zScore * stdDev,
        empirical: Number(value)
      };
    });
  };

  // 使用默认数据确保图表能显示
  const defaultHistogramData = [
    { name: 'Group 1', count: 10 },
    { name: 'Group 2', count: 20 },
    { name: 'Group 3', count: 30 },
    { name: 'Group 4', count: 25 },
    { name: 'Group 5', count: 15 }
  ];

  const defaultLineData = [
    { name: '1', value: 10 },
    { name: '2', value: 20 },
    { name: '3', value: 30 },
    { name: '4', value: 40 },
    { name: '5', value: 50 },
    { name: '6', value: 45 },
    { name: '7', value: 55 }
  ];

  // 当数据变化时重新计算统计量
  useEffect(() => {
    const stats = calculateStatistics();
    setLocalAnalysisResult(stats);
  }, [data]);

  // 确保始终使用有效的数据
  const histogramData = useMemo(() => {
    const generated = generateHistogramData();
    return generated.length > 0 ? generated : defaultHistogramData;
  }, [data]);
  
  const lineChartData = useMemo(() => {
    const generated = generateLineChartData();
    return generated.length > 0 ? generated : defaultLineData;
  }, [data]);
  const qqPlotData = generateQQPlotData();

  if (data.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-neutral-200">
        <div className="text-center py-12">
          <p className="text-neutral-600 text-lg">请先输入数据以查看基本统计分析结果</p>
        </div>
      </div>
    );
  }

  // 统计卡片配置
  const statCards = [
    { icon: '📊', title: '样本量', value: localAnalysisResult?.count || 0, color: 'bg-primary' },
    { icon: '📈', title: '均值', value: (localAnalysisResult?.mean || 0).toFixed(4), color: 'bg-secondary' },
    { icon: '📉', title: '中位数', value: (localAnalysisResult?.median || 0).toFixed(4), color: 'bg-purple-500' },
    { icon: '📏', title: '标准差', value: (localAnalysisResult?.stdDev || 0).toFixed(4), color: 'bg-amber-500' },
    { icon: '⬇️', title: '最小值', value: (localAnalysisResult?.min || 0).toFixed(4), color: 'bg-rose-500' },
    { icon: '⬆️', title: '最大值', value: (localAnalysisResult?.max || 0).toFixed(4), color: 'bg-emerald-500' }
  ];

  return (
    <div className="space-y-8 fade-in">
      {/* 统计概览卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {statCards.map((card, index) => (
          <StatCard 
            key={index}
            title={card.title} 
            value={card.value} 
            icon={card.icon} 
            color={card.color}
          />
        ))}
      </div>

      {/* 图表控制 */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-lg shadow-sm border border-neutral-200">
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={showHistogram} 
            onChange={(e) => setShowHistogram(e.target.checked)} 
            className="rounded text-primary focus:ring-primary"
          />
          <span>显示直方图</span>
        </label>
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={showLineChart} 
            onChange={(e) => setShowLineChart(e.target.checked)} 
            className="rounded text-primary focus:ring-primary"
          />
          <span>显示排序数据</span>
        </label>
        <label className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            checked={showQQPlot} 
            onChange={(e) => setShowQQPlot(e.target.checked)} 
            className="rounded text-primary focus:ring-primary"
          />
          <span>显示QQ图</span>
        </label>
      </div>

      {/* 详细统计信息表格 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
        <h3 className="text-xl font-bold mb-6 text-neutral-800 flex items-center gap-2">
          📋 详细统计信息
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl overflow-hidden">
            <tbody className="divide-y divide-neutral-200">
              <StatRow label="样本量" value={localAnalysisResult?.count || 0} />
              <StatRow label="均值" value={(localAnalysisResult?.mean || 0).toFixed(6)} />
              <StatRow label="中位数" value={(localAnalysisResult?.median || 0).toFixed(6)} />
              <StatRow label="方差" value={(localAnalysisResult?.variance || 0).toFixed(6)} />
              <StatRow label="标准差" value={(localAnalysisResult?.stdDev || 0).toFixed(6)} />
              <StatRow label="最小值" value={(localAnalysisResult?.min || 0).toFixed(6)} />
              <StatRow label="最大值" value={(localAnalysisResult?.max || 0).toFixed(6)} />
              <StatRow label="值域范围" value={`${(localAnalysisResult?.min || 0).toFixed(6)} - ${(localAnalysisResult?.max || 0).toFixed(6)}`} />
              <StatRow label="偏度" value={(localAnalysisResult?.skewness || 0).toFixed(6)} />
              <StatRow label="峰度" value={(localAnalysisResult?.kurtosis || 0).toFixed(6)} />
              <StatRow label="第一四分位数" value={(localAnalysisResult?.quartile1 || 0).toFixed(6)} />
              <StatRow label="第三四分位数" value={(localAnalysisResult?.quartile3 || 0).toFixed(6)} />
              <StatRow label="四分位距" value={(localAnalysisResult && localAnalysisResult.quartile3 !== undefined && localAnalysisResult.quartile1 !== undefined ? (localAnalysisResult.quartile3 - localAnalysisResult.quartile1) : 0).toFixed(6)} />
            </tbody>
          </table>
        </div>
      </div>

      {/* 数据可视化 */}
      <div className="space-y-6">
        {/* 直方图 */}
        {showHistogram && (
          <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-text-primary">📊 数据分布直方图</h3>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                  />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value} 个`, '频率']} 
                    contentStyle={{ 
                      borderRadius: '0.75rem', 
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="#4f46e5" 
                    name="频率" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* 排序数据折线图 */}
        {showLineChart && (
          <div className="bg-white p-6 rounded-xl border border-border-color shadow-sm">
            <h3 className="text-xl font-semibold mb-6 text-text-primary">📈 数据排序折线图</h3>
            <div style={{ height: '400px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineChartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis 
                    dataKey="name" 
                    label={{ value: '数据点索引', position: 'insideBottomRight', offset: -10 }}
                    tick={{ fill: '#6b7280' }}
                  />
                  <YAxis 
                    label={{ value: '数值', angle: -90, position: 'insideLeft' }} 
                    tick={{ fill: '#6b7280' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '0.75rem', 
                      border: '1px solid #e5e7eb',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    name="数值" 
                    dot={{ r: 4, fill: '#4f46e5', strokeWidth: 0 }} 
                    strokeWidth={2.5}
                  />
                  <ReferenceLine 
                    y={localAnalysisResult?.mean || 0} 
                    stroke="#4f46e5" 
                    strokeDasharray="3 3" 
                    name="均值"
                    label={{ value: '均值', position: 'right' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {/* QQ图 */}
        {showQQPlot && qqPlotData.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
            <h3 className="text-lg font-semibold mb-4">📐 正态分布QQ图</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="theoretical" 
                    name="理论分位数" 
                    label={{ value: '理论分位数', position: 'insideBottomRight', offset: -10 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="empirical" 
                    name="经验分位数" 
                    label={{ value: '经验分位数', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(4), '']}
                    labelFormatter={() => '数据点'}
                  />
                  <Scatter 
                    name="数据点" 
                    data={qqPlotData} 
                    fill="#8884d8" 
                  />
                  {/* 对角线 */}
                  <Line 
                    type="monotone" 
                    data={[
                      {theoretical: qqPlotData[0].theoretical, empirical: qqPlotData[0].theoretical},
                      {theoretical: qqPlotData[qqPlotData.length-1].theoretical, empirical: qqPlotData[qqPlotData.length-1].theoretical}
                    ]} 
                    stroke="#ff7300" 
                    strokeDasharray="5 5" 
                    name="理想线" 
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
      
      {/* 置信区间分析 */}
      {localAnalysisResult && (
        <ConfidenceInterval 
          analysisResult={localAnalysisResult} 
        />
      )}
    </div>
  );
};

// 统计卡片组件
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="stat-card p-5 rounded-xl border border-border-color bg-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-text-primary">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-full text-white`}>{icon}</div>
      </div>
    </div>
  );
};

// 统计表格行组件
interface StatRowProps {
  label: string;
  value: string | number;
}

const StatRow: React.FC<StatRowProps> = ({ label, value }) => {
  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-600">{label}</td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900">{value}</td>
    </tr>
  );
};

export default BasicStatistics;