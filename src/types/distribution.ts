// 分布类型定义
export type DistributionType = 'normal' | 'binomial' | 'poisson';

// 分布数据点接口
export interface DistributionData {
  x: number;
  y: number;
}

// 正态分布参数接口
export interface NormalDistributionParams {
  mean: number;
  variance: number;
}

// 二项分布参数接口
export interface BinomialDistributionParams {
  n: number;
  p: number;
}

// 泊松分布参数接口
export interface PoissonDistributionParams {
  lambda: number;
}

// 分布参数联合类型
export type DistributionParams = 
  | { type: 'normal' } & NormalDistributionParams
  | { type: 'binomial' } & BinomialDistributionParams
  | { type: 'poisson' } & PoissonDistributionParams;

// 所有分布参数的集合接口
export interface AllDistributionParams {
  normal: NormalDistributionParams;
  binomial: BinomialDistributionParams;
  poisson: PoissonDistributionParams;
}
