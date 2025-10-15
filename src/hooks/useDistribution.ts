import { useState, useEffect } from 'react';
import { generateNormalDistributionData, generateBinomialDistributionData, generatePoissonDistributionData } from '../services/calculations/distributionCalculations';

// 直接在文件内定义所需类型
type DistributionType = 'normal' | 'binomial' | 'poisson';

interface DistributionData {
  x: number;
  y: number;
}

interface NormalDistributionParams {
  mean: number;
  variance: number;
}

interface BinomialDistributionParams {
  n: number;
  p: number;
}

interface PoissonDistributionParams {
  lambda: number;
}

interface AllDistributionParams {
  normal: NormalDistributionParams;
  binomial: BinomialDistributionParams;
  poisson: PoissonDistributionParams;
}

// 自定义hook：管理分布状态和数据生成
export const useDistribution = () => {
  const [distributionType, setDistributionType] = useState<DistributionType>('normal');
  const [data, setData] = useState<DistributionData[]>([]);
  
  // 所有分布的参数
  const [params, setParams] = useState<AllDistributionParams>({
    normal: {
      mean: 0,
      variance: 1
    },
    binomial: {
      n: 10,
      p: 0.5
    },
    poisson: {
      lambda: 3
    }
  });

  // 生成分布数据
  useEffect(() => {
    let newData: DistributionData[] = [];
    
    switch (distributionType) {
      case 'normal':
        newData = generateNormalDistributionData(params.normal);
        break;
      case 'binomial':
        newData = generateBinomialDistributionData(params.binomial);
        break;
      case 'poisson':
        newData = generatePoissonDistributionData(params.poisson);
        break;
    }
    
    setData(newData);
  }, [distributionType, params]);

  // 更新正态分布参数
  const updateNormalParams = (newParams: Partial<typeof params.normal>) => {
    setParams(prev => ({
      ...prev,
      normal: {
        ...prev.normal,
        ...newParams
      }
    }));
  };

  // 更新二项分布参数
  const updateBinomialParams = (newParams: Partial<typeof params.binomial>) => {
    setParams(prev => ({
      ...prev,
      binomial: {
        ...prev.binomial,
        ...newParams
      }
    }));
  };

  // 更新泊松分布参数
  const updatePoissonParams = (newParams: Partial<typeof params.poisson>) => {
    setParams(prev => ({
      ...prev,
      poisson: {
        ...prev.poisson,
        ...newParams
      }
    }));
  };

  // 获取当前分布的显示名称
  const getCurrentDistributionName = () => {
    switch (distributionType) {
      case 'normal':
        return `正态分布 N(${params.normal.mean}, ${params.normal.variance})`;
      case 'binomial':
        return `二项分布 B(${params.binomial.n}, ${params.binomial.p})`;
      case 'poisson':
        return `泊松分布 P(${params.poisson.lambda})`;
    }
  };

  return {
    distributionType,
    setDistributionType,
    data,
    params,
    updateNormalParams,
    updateBinomialParams,
    updatePoissonParams,
    getCurrentDistributionName
  };
};