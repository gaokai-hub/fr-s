import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import { dashScopeService } from '../services/dashScopeService';

// 定义数据点接口
export interface DataPoint {
  value: number;
}

// 定义分析结果接口
export interface AnalysisResult {
  mean: number;
  median: number;
  mode: number | null;
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  count: number;
  range: number;
  skewness: number;
  kurtosis: number;
  q1: number;
  q3: number;
  iqr: number;
}

// 参数估计结果接口
export interface ParameterEstimationResult {
  distribution: string;
  method: 'MLE' | 'MoM';
  params: Record<string, number>;
  logLikelihood?: number;
  aic?: number;
  bic?: number;
}

// 定义分布参数接口
export interface DistributionParams {
  type: string;
  size: number;
  mean?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  rate?: number;
  lambda?: number;
}

// 定义上下文状态类型
interface DataContextType {
  data: DataPoint[];
  setData: React.Dispatch<React.SetStateAction<DataPoint[]>>;
  analysisResult: AnalysisResult | null;
  setAnalysisResult: React.Dispatch<React.SetStateAction<AnalysisResult | null>>;
  parameterEstimationResult: ParameterEstimationResult | null;
  setParameterEstimationResult: React.Dispatch<React.SetStateAction<ParameterEstimationResult | null>>;
  inputMethod: string;
  setInputMethod: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string;
  setError: React.Dispatch<React.SetStateAction<string>>;
  handleFileUpload: (file: File) => Promise<void>;
  generateDistributionData: (distributionType: string, params: any) => void;
  generateDataWithAI: (prompt: string) => Promise<void>;
  clearData: () => void;
}

// 创建上下文
const DataContext = createContext<DataContextType | undefined>(undefined);

// 上下文提供者组件
interface DataProviderProps {
  children: ReactNode;
}

// 生成默认的演示数据（正态分布）
const generateDefaultData = (): DataPoint[] => {
  const mean = 50;
  const stdDev = 10;
  const size = 100;
  const defaultData: DataPoint[] = [];
  
  for (let i = 0; i < size; i++) {
    // Box-Muller变换生成正态分布随机数
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    defaultData.push({ value: mean + z0 * stdDev });
  }
  
  return defaultData;
};

// 辅助函数：计算四分位数
const calculatePercentile = (sortedData: number[], percentile: number): number => {
  const index = percentile * (sortedData.length - 1);
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const weight = index - lowerIndex;
  
  if (upperIndex >= sortedData.length) return sortedData[sortedData.length - 1];
  return sortedData[lowerIndex] * (1 - weight) + sortedData[upperIndex] * weight;
};

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // 使用默认演示数据初始化
  const [data, setData] = useState<DataPoint[]>(generateDefaultData());
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [parameterEstimationResult, setParameterEstimationResult] = useState<ParameterEstimationResult | null>(null);
  const [inputMethod, setInputMethod] = useState<string>('file');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // 自动分析数据
  const analyzeData = useCallback((dataPoints: DataPoint[]) => {
    if (dataPoints.length === 0) {
      setAnalysisResult(null);
      return;
    }

    const values = dataPoints.map(dp => dp.value).sort((a, b) => a - b);
    const n = values.length;
    
    // 计算基本统计量
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    
    // 中位数
    let median;
    if (n % 2 === 0) {
      median = (values[n / 2 - 1] + values[n / 2]) / 2;
    } else {
      median = values[Math.floor(n / 2)];
    }
    
    // 众数（简化版，找到出现次数最多的值）
    const valueCounts = new Map<number, number>();
    values.forEach(val => {
      valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
    });
    let mode: number | null = null;
    let maxCount = 0;
    valueCounts.forEach((count, val) => {
      if (count > maxCount) {
        maxCount = count;
        mode = val;
      }
    });
    
    // 如果所有值出现次数相同，则没有众数
    if (maxCount === 1) mode = null;
    
    // 方差和标准差
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / (n - 1);
    const stdDev = Math.sqrt(variance);
    
    // 最小值、最大值、范围
    const min = values[0];
    const max = values[n - 1];
    const range = max - min;
    
    // 四分位数
    const q1 = calculatePercentile(values, 0.25);
    const q3 = calculatePercentile(values, 0.75);
    const iqr = q3 - q1;
    
    // 偏度
    const skewness = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 3), 0) / n;
    
    // 峰度
    const kurtosis = values.reduce((sum, val) => sum + Math.pow((val - mean) / stdDev, 4), 0) / n - 3;
    
    setAnalysisResult({
      mean,
      median,
      mode,
      variance,
      stdDev,
      min,
      max,
      count: n,
      range,
      skewness,
      kurtosis,
      q1,
      q3,
      iqr
    });
  }, [setAnalysisResult]);

  // 监听数据变化，自动进行分析
  React.useEffect(() => {
    if (data.length > 0) {
      analyzeData(data);
    } else {
      setAnalysisResult(null);
    }
  }, [data, analyzeData]);

  // 处理文件上传
  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      const text = await file.text();
      // 简单解析CSV或TXT文件
      const lines = text.trim().split('\n');
      const parsedData: DataPoint[] = [];
      
      for (const line of lines) {
        const values = line.split(/[,\s]+/);
        for (const value of values) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            parsedData.push({ value: num });
          }
        }
      }
      
      if (parsedData.length > 0) {
        setData(parsedData);
        setInputMethod('file');
        console.log(`成功上传并解析了 ${parsedData.length} 个数据点`);
      } else {
        throw new Error('无法从文件中解析有效数据');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '文件处理失败');
    } finally {
      setLoading(false);
    }
  }, [setData, setInputMethod, setLoading, setError]);

  // 生成分布数据
  const generateDistributionData = useCallback((distributionType: string, params: any) => {
    setLoading(true);
    setError('');
    
    try {
      const { count } = params;
      const generatedData: DataPoint[] = [];
      
      for (let i = 0; i < count; i++) {
        let value = 0;
        
        switch (distributionType) {
          case 'normal':
            // 使用Box-Muller变换生成正态分布
            const u1 = Math.random();
            const u2 = Math.random();
            const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
            value = params.mean + params.stdDev * z0;
            break;
            
          case 'uniform':
            value = params.min + Math.random() * (params.max - params.min);
            break;
            
          case 'exponential':
            value = -Math.log(Math.random()) / params.lambda;
            break;
            
          case 'poisson':
            // 简化的Poisson生成算法
            let k = 0;
            let p = 1;
            const L = Math.exp(-params.lambda);
            while (p > L) {
              k++;
              p *= Math.random();
            }
            value = k - 1;
            break;
        }
        
        generatedData.push({ value });
      }
      
      setData(generatedData);
      setInputMethod('distribution');
      console.log(`成功生成了 ${generatedData.length} 个${distributionType}分布的数据点`);
    } catch (err) {
      setError(err instanceof Error ? err.message : '数据生成失败');
    } finally {
      setLoading(false);
    }
  }, [setData, setInputMethod, setLoading, setError]);

  // 生成AI数据 - 增强版，优化中国用户体验和错误处理
  const generateDataWithAI = useCallback(async (prompt: string) => {
    setLoading(true);
    setError('');
    
    try {
      // 从localStorage获取API密钥
      const apiKey = localStorage.getItem('dashScopeApiKey');
      
      let generatedData: DataPoint[] = [];
      let isUsingFallback = false;
      let errorMessage = '';
      
      if (apiKey) {
        try {
          // 设置API密钥
          dashScopeService.setApiKey(apiKey);
          
          // 调用DashScope API
          console.log('开始调用DashScope API生成数据...');
          const result = await dashScopeService.generateDataFromPrompt(prompt);
          
          if (result.success && result.data.length > 0) {
            generatedData = result.data;
            console.log(`成功从DashScope API获取数据: ${generatedData.length} 个数据点`);
            // 如果有响应时间信息，可以显示给用户
            if (result.apiResponseTime) {
              console.log(`API响应时间: ${result.apiResponseTime}ms`);
            }
          } else {
            // API调用失败，使用回退机制
            isUsingFallback = true;
            errorMessage = result.error || 'API返回无有效数据';
            console.warn('API调用失败，使用增强的模拟数据生成机制:', errorMessage);
            generatedData = dashScopeService.generateFallbackData(prompt);
          }
        } catch (apiError) {
          // API调用出错，使用回退机制
          isUsingFallback = true;
          errorMessage = apiError instanceof Error ? apiError.message : 'API调用异常';
          console.error('API调用时发生错误:', errorMessage);
          generatedData = dashScopeService.generateFallbackData(prompt);
        }
      } else {
        // 没有API密钥提示用户没有设置API密钥
        isUsingFallback = true;
        errorMessage = '未设置DashScope API密钥，使用本地模拟数据';
        console.log('没有API密钥，使用回退机制:', errorMessage);
        generatedData = dashScopeService.generateFallbackData(prompt);
      }
      
      if (generatedData.length > 0) {
        setData(generatedData);
        setInputMethod('ai');
        
        // 设置适当的错误信息，对于回退机制要友好提示用户
        if (isUsingFallback) {
          // 针对回退的友好提示，不使用error状态，而是使用info状态
          // 这里我们仍然使用setError，但会提供更友好的信息
          if (apiKey) {
            // 如果用户提供了API密钥但使用了回退，提供更详细的信息
            setError(`🔄 使用本地模拟数据: ${errorMessage}\n提示：如您希望使用AI生成，请确保网络可以访问阿里云DashScope服务并检查API密钥是否正确`);
          } else {
            // 如果用户没有提供API密钥，提示用户如何获取
            setError(`🔄 使用本地模拟数据\n提示：您可以在阿里云DashScope控制台(https://dashscope.console.aliyun.com/)获取API密钥以使用AI生成功能`);
          }
        }
        
        console.log(`成功生成了 ${generatedData.length} 个数据点${isUsingFallback ? ' (使用本地模拟数据)' : ''}`);
      } else {
        throw new Error('AI数据生成失败，请尝试调整提示词或检查网络连接');
      }
    } catch (err) {
      const finalError = err instanceof Error ? err.message : 'AI数据生成失败';
      setError(`❌ ${finalError}`);
      
      // 生成保底数据，确保用户界面不会空白
      const fallbackData = Array.from({ length: 50 }, () => ({ 
        value: Math.random() * 100 
      }));
      setData(fallbackData);
      console.log('生成保底数据:', fallbackData.length, '个点');
    } finally {
      setLoading(false);
    }
  }, [setData, setInputMethod, setLoading, setError]);

  // 清除数据
  const clearData = useCallback(() => {
    setData([]);
    setAnalysisResult(null);
    setParameterEstimationResult(null);
    setError('');
  }, [setData, setAnalysisResult, setParameterEstimationResult, setError]);

  const contextValue: DataContextType = {
    data,
    setData,
    analysisResult,
    setAnalysisResult,
    parameterEstimationResult,
    setParameterEstimationResult,
    inputMethod,
    setInputMethod,
    loading,
    setLoading,
    error,
    setError,
    handleFileUpload,
    generateDistributionData,
    generateDataWithAI,
    clearData
  };

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
};

// 自定义Hook，用于访问上下文
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};