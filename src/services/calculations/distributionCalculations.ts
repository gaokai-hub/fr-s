// 直接在文件内定义所需类型
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

// 正态分布概率密度函数
export const normalPDF = (x: number, mean: number, variance: number): number => {
  const stdDev = Math.sqrt(variance);
  const coefficient = 1 / (stdDev * Math.sqrt(2 * Math.PI));
  const exponent = -Math.pow(x - mean, 2) / (2 * variance);
  return coefficient * Math.exp(exponent);
};

// 二项分布概率质量函数
export const binomialPMF = (k: number, n: number, p: number): number => {
  // 计算组合数 C(n, k)
  const comb = (n: number, k: number): number => {
    if (k === 0 || k === n) return 1;
    if (k > n || k < 0) return 0;
    k = Math.min(k, n - k);
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result = result * (n - k + i) / i;
    }
    return result;
  };
  
  return comb(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
};

// 泊松分布概率质量函数
export const poissonPMF = (k: number, lambda: number): number => {
  if (k < 0 || lambda < 0) return 0;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
};

// 阶乘函数
export const factorial = (n: number): number => {
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
};

// 生成正态分布数据
export const generateNormalDistributionData = (params: NormalDistributionParams): DistributionData[] => {
  const { mean, variance } = params;
  const stdDev = Math.sqrt(variance);
  const data: DistributionData[] = [];
  
  for (let x = mean - 4 * stdDev; x <= mean + 4 * stdDev; x += 0.1) {
    const y = normalPDF(x, mean, variance);
    data.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(6)) });
  }
  
  return data;
};

// 生成二项分布数据
export const generateBinomialDistributionData = (params: BinomialDistributionParams): DistributionData[] => {
  const { n, p } = params;
  const data: DistributionData[] = [];
  
  for (let k = 0; k <= n; k++) {
    const y = binomialPMF(k, n, p);
    data.push({ x: k, y: parseFloat(y.toFixed(6)) });
  }
  
  return data;
};

// 生成泊松分布数据
export const generatePoissonDistributionData = (params: PoissonDistributionParams): DistributionData[] => {
  const { lambda } = params;
  const data: DistributionData[] = [];
  
  for (let k = 0; k <= lambda * 3; k++) {
    const y = poissonPMF(k, lambda);
    data.push({ x: k, y: parseFloat(y.toFixed(6)) });
  }
  
  return data;
};

// 根据分布类型生成数据的工厂函数
export const generateDistributionData = (
  distributionType: 'normal' | 'binomial' | 'poisson',
  params: any
): DistributionData[] => {
  switch (distributionType) {
    case 'normal':
      return generateNormalDistributionData(params as NormalDistributionParams);
    case 'binomial':
      return generateBinomialDistributionData(params as BinomialDistributionParams);
    case 'poisson':
      return generatePoissonDistributionData(params as PoissonDistributionParams);
    default:
      return [];
  }
};