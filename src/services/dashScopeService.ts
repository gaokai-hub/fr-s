// DashScope API 服务

export interface DashScopeConfig {
  apiKey: string;
  model: string;
  timeout?: number; // 请求超时时间（毫秒）
  retryCount?: number; // 重试次数
  retryDelay?: number;
}

export type DistributionType = 'normal' | 'uniform' | 'exponential' | 'poisson' | 'binomial' | 'lognormal' | 'gamma' | 'chisquare' | 'studentt';

export interface SimulationParameters {
  sampleCount: number;
  min: number;
  max: number;
  mean: number;
  stdDev: number;
  outlierRatio: number;
  hasDuplicates: boolean;
  precision: number;
}

interface AIDataGenerationResult {
  data: { value: number }[];
  success: boolean;
  error?: string;
  isFallback?: boolean; // 标记是否使用了回退数据
  apiResponseTime?: number; // API响应时间
}

// 默认配置
const DEFAULT_CONFIG: DashScopeConfig = {
  apiKey: '', // 用户需要填写自己的API密钥
  model: 'qwen-turbo',
  timeout: 10000, // 10秒超时
  retryCount: 1, // 1次重试
};

// 定义不同的错误类型
export const DashScopeErrorType = {
  API_KEY_MISSING: 'API_KEY_MISSING',
  API_RATE_LIMIT: 'API_RATE_LIMIT',
  API_AUTH_FAILED: 'API_AUTH_FAILED',
  API_TIMEOUT: 'API_TIMEOUT',
  PARSE_ERROR: 'PARSE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
} as const;

type DashScopeErrorTypeValue = typeof DashScopeErrorType[keyof typeof DashScopeErrorType];

interface DashScopeError extends Error {
  type?: DashScopeErrorTypeValue;
  originalError?: any;
}

class DashScopeService {
  private config: DashScopeConfig;
  private readonly DASHSCOPE_ENDPOINT = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation'; // 直接使用DashScope官方API地址

  constructor(config?: Partial<DashScopeConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  // 设置API密钥
  setApiKey(apiKey: string): void {
    this.config.apiKey = apiKey;
    console.log('DashScope API密钥已设置');
  }

  // 验证API密钥格式
  private isValidApiKey(apiKey: string): boolean {
    // DashScope API密钥通常是一个长字符串，这里做简单验证
    return !!apiKey && apiKey.trim().length > 10 && /^[a-zA-Z0-9_-]+$/.test(apiKey);
  }

  // 带超时的fetch请求
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError = new Error(`请求超时（${timeout}ms）`) as DashScopeError;
        timeoutError.type = DashScopeErrorType.API_TIMEOUT;
        throw timeoutError;
      }
      throw error;
    }
  }

  // 错误处理和转换 - 增强版，针对中国网络环境优化
  private processError(error: any): { message: string; type: DashScopeErrorTypeValue } {
    let errorType: DashScopeErrorTypeValue = DashScopeErrorType.UNKNOWN_ERROR;
    let errorMessage = '未知错误';

    if (error instanceof Error) {
      // 检查是否是超时错误
      if (error.message && error.message.includes('timeout')) {
        errorType = DashScopeErrorType.API_TIMEOUT;
        errorMessage = '请求超时，请检查您的网络连接。在中国使用时，可能需要检查防火墙或网络代理设置。';
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorType = DashScopeErrorType.NETWORK_ERROR;
        errorMessage = '网络请求失败，可能是CORS限制、网络问题或防火墙拦截。在中国使用时，请确保您的网络允许访问阿里云API服务。';
      } else if ((error as any).type && Object.values(DashScopeErrorType).includes((error as any).type)) {
        errorType = (error as any).type;
        errorMessage = error.message;
      } else {
        errorMessage = error.message;
      }
    }

    // 针对DashScope API特有的错误识别
    const errorMsgLower = errorMessage.toLowerCase();
    if (errorMsgLower.includes('apikey') || errorMsgLower.includes('key') || errorMsgLower.includes('401') || errorMsgLower.includes('unauthorized')) {
      errorType = DashScopeErrorType.API_AUTH_FAILED;
      errorMessage = 'API密钥无效或已过期，请检查您的DashScope API密钥格式和有效性。';
    } else if (errorMsgLower.includes('rate') || errorMsgLower.includes('limit') || errorMsgLower.includes('429')) {
      errorType = DashScopeErrorType.API_RATE_LIMIT;
      errorMessage = '请求过于频繁，请稍后再试。DashScope API有请求频率限制，请减少请求频率。';
    } else if (errorMsgLower.includes('50') || errorMsgLower.includes('server') || errorMsgLower.includes('internal')) {
      errorType = DashScopeErrorType.SERVER_ERROR;
      errorMessage = '服务器错误，请稍后再试。如果问题持续，请检查DashScope服务状态或联系阿里云客服。';
    } else if (errorMsgLower.includes('parse') || errorMsgLower.includes('json')) {
      errorType = DashScopeErrorType.PARSE_ERROR;
      errorMessage = '解析数据失败，请检查提示词是否清晰，或使用更具体的数据描述。';
    }

    // 添加网络环境提示
    if (errorType === DashScopeErrorType.NETWORK_ERROR || errorType === DashScopeErrorType.API_TIMEOUT) {
      errorMessage += '\n提示：在中国使用时，建议：\n1. 确保网络稳定\n2. 检查防火墙设置\n3. 如使用企业网络，可能需要申请网络访问权限\n4. 我们将自动切换到本地模拟数据生成';
    }

    return { message: errorMessage, type: errorType };
  }

  // 从用户提示生成数据（增强版，包含错误处理和重试机制）
  async generateDataFromPrompt(prompt: string): Promise<AIDataGenerationResult> {
    try {
      // 检查API密钥
      if (!this.config.apiKey) {
        const error = new Error('请设置DashScope API密钥') as DashScopeError;
        error.type = DashScopeErrorType.API_KEY_MISSING;
        throw error;
      }

      // 验证API密钥格式
      if (!this.isValidApiKey(this.config.apiKey)) {
        const error = new Error('API密钥格式无效') as DashScopeError;
        error.type = DashScopeErrorType.API_AUTH_FAILED;
        throw error;
      }

      // 构建系统提示
      const systemPrompt = `你是一个数据分析助手，请根据用户的描述生成符合要求的数值数据。
      请以JSON格式输出，只包含一个名为"data"的数组，其中包含一系列数值对象，每个对象有一个"value"字段。
      例如：{"data": [{"value": 10.5}, {"value": 20.3}, ...]}
      请确保生成的数据数量合理（建议100-500个数据点），数据符合用户描述的分布特征。`;

      // 构建请求体
      const requestBody = {
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7 // 添加温度参数控制生成多样性
      };

      const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(requestBody)
      };

      let startTime = Date.now();

      // 实现重试逻辑和中国网络环境适配
      let response: Response | undefined;
      
      // 添加CORS和网络环境适配
      const enhancedOptions = {
        ...requestOptions,
        // 针对中国网络环境的特殊处理
        headers: {
          ...requestOptions.headers,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        credentials: 'omit' as RequestCredentials // 避免跨域凭证问题
      };
      
      for (let attempt = 0; attempt <= this.config.retryCount!; attempt++) {
        try {
          // 使用直接的DashScope API端点，适合中国用户
          response = await this.fetchWithTimeout(
            this.DASHSCOPE_ENDPOINT,
            enhancedOptions,
            this.config.timeout!
          );
          break;
        } catch (error) {
          // 详细的错误日志记录
          console.error(`请求尝试 ${attempt + 1} 失败:`, error);
          
          // 针对不同错误类型的处理
          if (attempt === this.config.retryCount!) {
            // 最后一次尝试失败，准备使用回退机制
            throw error;
          }
          
          // 网络错误或超时错误优先重试
          if (error instanceof Error) {
            const isNetworkError = error.message.includes('Failed to fetch') || 
                                  error.name === 'TypeError' || 
                                  (error as any).type === DashScopeErrorType.NETWORK_ERROR ||
                                  (error as any).type === DashScopeErrorType.API_TIMEOUT;
            
            if (isNetworkError) {
              // 否则进行重试
              console.warn(`网络请求失败，正在进行第 ${attempt + 1} 次重试...`);
              // 添加指数退避，考虑中国网络环境增加重试延迟
              const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500; // 增加随机延迟避免雪崩
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
          }
          
          // 非网络错误直接抛出
          throw error;
        }
      }

      let responseTime = Date.now() - startTime;
      console.log(`DashScope API响应时间: ${responseTime}ms`);

      if (!response || !response.ok) {
        let errorMessage = response ? `HTTP错误! 状态码: ${response.status}` : '请求失败：没有收到响应';
        
        // 尝试解析错误响应
        try {
          const errorData = await (response as Response).json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          console.warn('无法解析错误响应:', e);
        }
        
        const processedError = this.processError(new Error(errorMessage));
        return {
          success: false,
          data: [],
          error: processedError.message,
          apiResponseTime: responseTime
        };
      }

      if (!response) {
        throw new Error('请求失败：没有收到响应');
      }
      const data = await response.json();
      
      // 解析模型返回的数据
      let resultData: { value: number }[] = [];
      
      try {
        // 提取模型返回的内容
        const content = data.output?.choices?.[0]?.message?.content || 
                       data.output?.text || 
                       data.text || 
                       '';
        
        console.log('模型返回原始内容:', content);
        
        // 增强的JSON解析逻辑
        resultData = this.parseModelOutput(content);
        
        // 验证数据
        if (resultData.length === 0) {
          throw new Error('未找到有效的数据格式');
        }
        
        // 限制数据量，防止生成过多数据
        if (resultData.length > 1000) {
          console.warn('数据量过大，将截断为1000个数据点');
          resultData = resultData.slice(0, 1000);
        }
        
        console.log(`成功解析 ${resultData.length} 个数据点`);
        
      } catch (parseError) {
        console.error('解析模型返回的数据失败:', parseError);
        const processedError = this.processError({
          message: parseError instanceof Error ? parseError.message : String(parseError),
          type: DashScopeErrorType.PARSE_ERROR
        });
        return {
          success: false,
          data: [],
          error: '解析AI返回的数据格式失败: ' + processedError.message,
          apiResponseTime: responseTime
        };
      }
      
      return {
        success: true,
        data: resultData,
        error: '',
        apiResponseTime: responseTime
      };
    } catch (error) {
      console.error('API调用时发生错误:', error);
      const processedError = this.processError(error);
      
      return {
        success: false,
        data: [],
        error: processedError.message
      };
    }
  }

  // 增强的模型输出解析函数
  private parseModelOutput(content: string): { value: number }[] {
    let parsedData: any = null;
    
    // 清理内容，去除可能的Markdown代码块标记
    const cleanContent = content
      .replace(/^```json|^```|```$/g, '')
      .trim();
    
    try {
      // 尝试直接解析JSON
      parsedData = JSON.parse(cleanContent);
    } catch (e) {
      // 如果直接解析失败，尝试提取JSON字符串
      const jsonRegex = /\{[^}]*\"data\":\s*\[[^\]]*\][^}]*\}/;
      const match = cleanContent.match(jsonRegex);
      
      if (match) {
        try {
          parsedData = JSON.parse(match[0]);
        } catch (innerError) {
          // 如果还是失败，尝试更宽松的匹配
          const arrayRegex = /\[([^{}]*(?:\{[^}]*\}[^{}]*)*)\]/;
          const arrayMatch = cleanContent.match(arrayRegex);
          
          if (arrayMatch) {
            try {
              parsedData = JSON.parse(arrayMatch[0]);
            } catch (arrayError) {
              throw new Error('无法从响应中提取有效的JSON数据');
            }
          } else {
            throw new Error('响应中未找到有效的数据数组');
          }
        }
      } else {
        throw new Error('响应中未找到有效的JSON对象');
      }
    }
    
    // 处理不同的数据格式
    let resultArray: any[] = [];
    
    if (Array.isArray(parsedData.data)) {
      resultArray = parsedData.data;
    } else if (Array.isArray(parsedData)) {
      resultArray = parsedData;
    } else {
      throw new Error('解析后的数据不是预期的数组格式');
    }
    
    // 过滤和转换数据
    return resultArray
      .map((item: any) => {
        // 处理不同的数值格式
        if (typeof item === 'number') {
          return { value: item };
        } else if (typeof item === 'object' && item !== null) {
          // 查找可能的数值字段
          const value = item.value ?? item.Value ?? item.VALUE ?? 
                        item.num ?? item.Num ?? item.NUM ?? 
                        item.amount ?? item.Amount ?? item.AMOUNT;
          
          if (typeof value === 'number') {
            return { value };
          } else if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            return { value: parseFloat(value) };
          }
        }
        return undefined;
      })
      .filter((item: any): item is { value: number } => item !== undefined && !isNaN(item.value));
  }

  /**
   * 生成回退的模拟数据 - 增强版，基于用户提示智能生成数据
   */
  generateFallbackData(prompt: string): { value: number }[] {
    try {
      console.log('使用增强版智能模拟数据生成', { prompt });
      
      // 提取参数
      const params = this.extractParametersFromPrompt(prompt);
      console.log('从提示中提取的参数:', params);
      
      // 检测分布类型
      const distributionType = this.detectDistributionType(prompt, params);
      console.log('检测到的分布类型:', distributionType);
      
      // 生成基础数据
      let data = this.generateDataByDistribution(distributionType, params);
      
      // 应用后处理
      data = this.applyDataPostProcessing(data, params);
      
      console.log(`成功生成${data.length}个模拟数据点，分布类型:${distributionType}`);
      return data;
    } catch (error) {
      console.error('生成模拟数据时发生错误:', error);
      // 兜底方案：返回简单的正态分布数据
      return this.generateSimpleNormalData(50, 0, 100);
    }
  }
  
  /**
   * 从提示中提取参数
   */
  private extractParametersFromPrompt(prompt: string): SimulationParameters {
    // 从提示中提取样本数量（默认为100）
    const sampleCountMatch = prompt.match(/(生成|创建|提供|需要|有)\s*(约)?\s*(\d+)\s*(个|条|组|份)/i);
    const sampleCount = sampleCountMatch ? Math.min(parseInt(sampleCountMatch[3], 10), 1000) : 100;
    
    // 从提示中提取数值范围
    let min = 0;
    let max = 100;
    
    // 尝试提取范围，如"范围60-100"或"60到100之间"或"0到100"
    const rangeMatch = prompt.match(/(?:范围[：:])?(\d+(?:\.\d+)?)[\s-]*(?:到|至)[\s-]*(\d+(?:\.\d+)?)/i);
    if (rangeMatch) {
      min = parseFloat(rangeMatch[1]);
      max = parseFloat(rangeMatch[2]);
      // 确保min < max
      if (min >= max) {
        [min, max] = [max, min];
      }
    }
    
    // 尝试提取可能的异常值比例
    let outlierRatio = 0;
    const outlierMatch = prompt.match(/异常值(\d+)%/);
    if (outlierMatch) {
      outlierRatio = parseInt(outlierMatch[1]) / 100;
      outlierRatio = Math.min(Math.max(outlierRatio, 0), 0.2); // 限制在0-20%之间
    }
    
    // 提取可能的均值或期望值
    let mean = (min + max) / 2;
    const meanMatch = prompt.match(/均值[为:：]([\-\d.]+)/i) || prompt.match(/期望[为:：]([\-\d.]+)/i);
    if (meanMatch) {
      mean = parseFloat(meanMatch[1]);
    }
    
    // 提取可能的标准差
    let stdDev = (max - min) / 6; // 默认约99.7%的值在范围内
    const stdDevMatch = prompt.match(/标准差[为:：]([\-\d.]+)/i);
    if (stdDevMatch) {
      stdDev = parseFloat(stdDevMatch[1]);
    } else {
      // 尝试提取方差并转换为标准差
      const varianceMatch = prompt.match(/方差[为:：]([\-\d.]+)/i);
      if (varianceMatch) {
        const variance = parseFloat(varianceMatch[1]);
        stdDev = Math.sqrt(Math.abs(variance)); // 确保非负
      }
    }
    
    // 尝试提取是否有重复值的要求
    const hasDuplicates = prompt.toLowerCase().includes('重复');
    
    // 尝试提取数据精度要求
    let precision = 2;
    const precisionMatch = prompt.match(/保留(\d+)位小数/i);
    if (precisionMatch) {
      precision = parseInt(precisionMatch[1], 10);
      precision = Math.min(Math.max(precision, 0), 10); // 限制在0-10位之间
    }
    
    return {
      sampleCount,
      min,
      max,
      mean,
      stdDev,
      outlierRatio,
      hasDuplicates,
      precision
    };
  }
  
  /**
   * 检测分布类型
   */
  private detectDistributionType(prompt: string, params: SimulationParameters): DistributionType {
    const lowerPrompt = prompt.toLowerCase();
    
    if (lowerPrompt.includes('均匀')) {
      return 'uniform';
    } else if (lowerPrompt.includes('指数')) {
      return 'exponential';
    } else if (lowerPrompt.includes('泊松')) {
      return 'poisson';
    } else if (lowerPrompt.includes('二项') || lowerPrompt.includes('伯努利')) {
      return 'binomial';
    } else if (lowerPrompt.includes('正态') || lowerPrompt.includes('高斯')) {
      return 'normal';
    } else if (lowerPrompt.includes('对数正态')) {
      return 'lognormal';
    } else if (lowerPrompt.includes('伽马') || lowerPrompt.includes('gamma')) {
      return 'gamma';
    } else if (lowerPrompt.includes('卡方') || lowerPrompt.includes('chi-square')) {
      return 'chisquare';
    } else if (lowerPrompt.includes('学生t') || lowerPrompt.includes('student t')) {
      return 'studentt';
    } else {
      // 根据数据特征推断分布类型
      return this.inferDistributionFromFeatures(params);
    }
  }
  
  /**
   * 根据特征推断分布类型
   */
  private inferDistributionFromFeatures(params: SimulationParameters): DistributionType {
    // 如果明确指定了均值和标准差，倾向于正态分布
    if (params.stdDev !== (params.max - params.min) / 6) {
      return 'normal';
    }
    
    // 如果范围较小且无明显倾斜特征，使用均匀分布
    const range = params.max - params.min;
    if (range < 100) {
      return 'uniform';
    }
    
    // 默认正态分布
    return 'normal';
  }
  
  /**
   * 根据分布类型生成数据
   */
  private generateDataByDistribution(type: DistributionType, params: SimulationParameters): { value: number }[] {
    const { sampleCount, min, max, mean, stdDev } = params;
    
    switch (type) {
      case 'uniform':
        return this.generateUniformData(sampleCount, min, max);
        
      case 'exponential':
        return this.generateExponentialData(sampleCount, mean, min, max);
        
      case 'poisson':
        return this.generatePoissonData(sampleCount, mean, min, max);
        
      case 'binomial':
        return this.generateBinomialData(sampleCount, mean, min, max);
        
      case 'lognormal':
        return this.generateLognormalData(sampleCount, mean, stdDev);
        
      case 'gamma':
        return this.generateGammaData(sampleCount, mean, stdDev);
        
      case 'chisquare':
        return this.generateChisquareData(sampleCount, Math.max(2, Math.floor(mean))); // 自由度至少为2
        
      case 'studentt':
        return this.generateStudenttData(sampleCount, Math.max(1, Math.floor(mean / 2))); // 自由度至少为1
        
      default: // normal
        return this.generateNormalData(sampleCount, mean, stdDev);
    }
  }
  
  /**
   * 应用数据后处理
   */
  private applyDataPostProcessing(data: { value: number }[], params: SimulationParameters): { value: number }[] {
    let processedData = [...data];
    
    // 添加异常值
    if (params.outlierRatio > 0) {
      processedData = this.addOutliers(processedData, params.outlierRatio, params.min, params.max);
    }
    
    // 限制范围
    processedData = this.clampDataRange(processedData, params.min, params.max * 3); // 允许上限有较大空间
    
    // 应用精度
    if (params.precision >= 0) {
      processedData = processedData.map(item => ({
        value: parseFloat(item.value.toFixed(params.precision))
      }));
    }
    
    // 如果要求不重复，尝试移除重复值
    if (!params.hasDuplicates && processedData.length > 10) {
      processedData = this.removeDuplicates(processedData);
    }
    
    return processedData;
  }
  
  /**
   * 生成均匀分布数据
   */
  private generateUniformData(count: number, min: number, max: number): { value: number }[] {
    return Array.from({ length: count }, () => ({
      value: min + Math.random() * (max - min)
    }));
  }
  
  /**
   * 生成正态分布数据
   */
  private generateNormalData(count: number, mean: number, stdDev: number): { value: number }[] {
    const data: { value: number }[] = [];
    
    for (let i = 0; i < count; i += 2) {
      // Box-Muller变换生成两个独立的正态分布随机数
      const u1 = Math.random();
      const u2 = Math.random();
      
      const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      const z2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
      
      // 转换为目标均值和标准差
      data.push({ value: mean + z1 * stdDev });
      
      if (i + 1 < count) {
        data.push({ value: mean + z2 * stdDev });
      }
    }
    
    return data;
  }
  
  /**
   * 生成简单的正态分布数据（兜底方案）
   */
  private generateSimpleNormalData(count: number, min: number, max: number): { value: number }[] {
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6;
    
    return Array.from({ length: count }, () => {
      // 使用中心极限定理近似正态分布
      let sum = 0;
      for (let i = 0; i < 6; i++) {
        sum += Math.random();
      }
      const normal = (sum - 3) / 0.8165; // 标准化
      return { value: mean + normal * stdDev };
    });
  }
  
  /**
   * 生成指数分布数据
   */
  private generateExponentialData(count: number, mean: number, min: number, max: number): { value: number }[] {
    const lambda = 1 / (mean - min); // 调整lambda使得期望值接近指定均值
    return Array.from({ length: count }, () => {
      let value;
      let attempts = 0;
      do {
        value = -Math.log(Math.random()) / lambda + min;
        attempts++;
      } while (value > max * 1.5 && attempts < 10); // 允许一些超出范围的值，但不过分
      return { value };
    });
  }
  
  /**
   * 生成泊松分布数据
   */
  private generatePoissonData(count: number, mean: number, min: number, max: number): { value: number }[] {
    const lambda = Math.max(mean, 0.5); // λ必须为正数
    return Array.from({ length: count }, () => {
      // Knuth算法生成泊松分布
      let k = 0;
      let p = 1;
      do {
        k++;
        p *= Math.random();
      } while (p > Math.exp(-lambda) && k < 100); // 添加安全边界
      return { value: Math.max(min, Math.min(k - 1, max)) }; // 确保在合理范围内
    });
  }
  
  /**
   * 生成二项分布数据
   */
  private generateBinomialData(count: number, mean: number, min: number, max: number): { value: number }[] {
    const trials = 10;
    const successProb = Math.max(0, Math.min(1, mean / trials)); // 概率应在0-1之间
    
    return Array.from({ length: count }, () => {
      let successes = 0;
      for (let i = 0; i < trials; i++) {
        if (Math.random() < successProb) {
          successes++;
        }
      }
      // 映射到指定范围
      const scaledValue = min + (successes / trials) * (max - min);
      return { value: scaledValue };
    });
  }
  
  /**
   * 生成对数正态分布数据
   */
  private generateLognormalData(count: number, mean: number, stdDev: number): { value: number }[] {
    // 计算对数空间中的参数
    const logMean = Math.log(mean * mean / Math.sqrt(mean * mean + stdDev * stdDev));
    const logStdDev = Math.sqrt(Math.log(1 + stdDev * stdDev / (mean * mean)));
    
    return this.generateNormalData(count, logMean, logStdDev).map(item => ({
      value: Math.exp(item.value)
    }));
  }
  
  /**
   * 生成伽马分布数据（使用shape和scale参数）
   */
  private generateGammaData(count: number, mean: number, stdDev: number): { value: number }[] {
    // 根据均值和标准差计算shape和scale参数
    const variance = stdDev * stdDev;
    const shape = (mean * mean) / variance;
    const scale = variance / mean;
    
    return Array.from({ length: count }, () => {
      // 使用Marsaglia和Tsang的方法生成伽马分布随机数
      let x, v, u, d;
      do {
        d = shape - 1/3;
        const c = 1 / Math.sqrt(9 * d);
        do {
          x = this.generateNormalData(1, 0, 1)[0].value;
          v = 1 + c * x;
        } while (v <= 0);
        v = v * v * v;
        u = Math.random();
      } while (u >= 1 - 0.0331 * x * x * x * x || Math.log(u) >= 0.5 * x * x + d * (1 - v + Math.log(v)));
      
      return { value: d * v * scale };
    });
  }
  
  /**
   * 生成卡方分布数据
   */
  private generateChisquareData(count: number, degreesOfFreedom: number): { value: number }[] {
    // 卡方分布是伽马分布的特例，shape = df/2, scale = 2
    return Array.from({ length: count }, () => {
      let sum = 0;
      for (let i = 0; i < degreesOfFreedom; i++) {
        const normal = this.generateNormalData(1, 0, 1)[0].value;
        sum += normal * normal;
      }
      return { value: sum };
    });
  }
  
  /**
   * 生成学生t分布数据
   */
  private generateStudenttData(count: number, degreesOfFreedom: number): { value: number }[] {
    return Array.from({ length: count }, () => {
      const normal = this.generateNormalData(1, 0, 1)[0].value;
      const chiSquare = this.generateChisquareData(1, degreesOfFreedom)[0].value;
      return { value: normal / Math.sqrt(chiSquare / degreesOfFreedom) };
    });
  }
  
  /**
   * 添加异常值
   */
  private addOutliers(data: { value: number }[], ratio: number, min: number, max: number): { value: number }[] {
    const outlierCount = Math.floor(data.length * ratio);
    const result = [...data];
    const range = max - min;
    
    for (let i = 0; i < outlierCount; i++) {
      const index = Math.floor(Math.random() * data.length);
      const isHighOutlier = Math.random() > 0.5;
      
      if (isHighOutlier) {
        // 生成高异常值，根据数据范围调整幅度
        result[index].value = max + Math.random() * range * (1 + Math.random() * 3);
      } else {
        // 生成低异常值，确保不低于原始最小值的一定比例
        const outlierValue = min - Math.random() * range * (1 + Math.random() * 3);
        result[index].value = outlierValue;
      }
    }
    
    return result;
  }
  
  /**
   * 限制数据范围
   */
  private clampDataRange(data: { value: number }[], min: number, max: number): { value: number }[] {
    return data.map(item => ({
      value: Math.max(min, Math.min(item.value, max))
    }));
  }
  
  /**
   * 移除重复值
   */
  private removeDuplicates(data: { value: number }[]): { value: number }[] {
    // 对于浮点数，使用近似相等（考虑精度）
    const unique: { value: number }[] = [];
    const seen = new Set<number>();
    
    for (const item of data) {
      // 四舍五入到2位小数来检测重复
      const rounded = Math.round(item.value * 100) / 100;
      if (!seen.has(rounded)) {
        seen.add(rounded);
        unique.push(item);
      }
    }
    
    // 如果移除重复后数据量太少，补充一些随机数据
    if (unique.length < data.length * 0.5) {
      const additionalCount = data.length - unique.length;
      const min = Math.min(...unique.map(d => d.value));
      const max = Math.max(...unique.map(d => d.value));
      
      for (let i = 0; i < additionalCount; i++) {
        let value;
        do {
          value = min + Math.random() * (max - min);
        } while (seen.has(Math.round(value * 100) / 100));
        
        seen.add(Math.round(value * 100) / 100);
        unique.push({ value });
      }
    }
    
    return unique;
  }
}

// 导出单例实例
export const dashScopeService = new DashScopeService();
export default DashScopeService;