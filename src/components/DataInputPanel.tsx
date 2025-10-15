import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

interface DistributionParams {
  type: string;
  size: number;
  mean?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  rate?: number;
  lambda?: number;
}

const DataInputPanel: React.FC = () => {
  const { 
    inputMethod, 
    setInputMethod,
    loading,
    error,
    handleFileUpload,
    generateDistributionData,
    generateDataWithAI,
    clearData,
    data
  } = useData();
  
  const [file, setFile] = useState<File | null>(null);
  const [distributionParams, setDistributionParams] = useState<DistributionParams>({
    type: 'normal',
    mean: 0,
    stdDev: 1,
    size: 100
  });
  const [aiPrompt, setAiPrompt] = useState('生成100个正态分布的随机数，均值为10，标准差为2');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('dashScopeApiKey') || '');
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  
  // 提示词建议列表
  const aiPrompts = [
    '生成100个正态分布的随机数，均值为10，标准差为2',
    '生成50个均匀分布的随机数，范围在0到100之间',
    '生成80个指数分布的随机数，速率参数为0.5',
    '生成200个泊松分布的随机数，λ参数为3',
    '生成学生考试成绩数据，均值75，标准差10'
  ];
  
  // 重置文件状态当输入方法改变
  useEffect(() => {
    setFile(null);
  }, [inputMethod]);

  // 文件上传处理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // 重置文件输入以允许重新上传相同文件
      e.target.value = '';
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold mb-6">数据输入</h2>
      
      {/* 输入方式选择标签 */}
      <div className="flex space-x-4 mb-8">
        <button
          onClick={() => setInputMethod('file')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${inputMethod === 'file' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 transform' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105'}`}
        >
          文件上传
        </button>
        <button
          onClick={() => setInputMethod('distribution')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${inputMethod === 'distribution' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 transform' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105'}`}
        >
          分布生成
        </button>
        <button
          onClick={() => setInputMethod('ai')}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${inputMethod === 'ai' 
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 transform' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md hover:scale-105'}`}
        >
          AI 生成
        </button>
      </div>
      
      {/* 加载和错误状态 */}
      {loading && <div className="text-center py-4">加载中...</div>}
      {error && <div className="text-center py-4 text-red-500">{error}</div>}
      
      {/* 文件上传面板 - 现代化设计 */}
      {inputMethod === 'file' && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-center w-full">
            <label 
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-2xl bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg 
                  className="w-8 h-8 mb-4 text-gray-500" 
                  aria-hidden="true" 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 20 16"
                >
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">点击上传</span> 或拖放文件</p>
                <p className="text-xs text-gray-500">支持 CSV, TXT 文件</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                className="hidden" 
                onChange={handleFileChange}
                accept=".csv,.txt"
              />
            </label>
          </div>
          
          {file && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <p className="font-medium text-gray-800">已选择文件: {file.name}</p>
              <p className="text-sm text-gray-500">大小: {Math.round(file.size / 1024)} KB</p>
            </div>
          )}
          
          <div className="flex gap-4">
            <button 
              onClick={() => file && handleFileUpload(file)}
              disabled={!file || loading}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${!file || loading 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1'}`}
            >
              📁 上传数据
            </button>
            <button 
              onClick={clearData}
              className="px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 shadow-md hover:-translate-y-1"
            >
              🗑️ 清除
            </button>
          </div>
        </div>
      )}
      
      {/* 分布生成面板 - 现代化设计 */}
      {inputMethod === 'distribution' && (
        <div className="space-y-6 fade-in">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">分布类型</label>
            <select
              value={distributionParams.type}
              onChange={(e) => setDistributionParams({...distributionParams, type: e.target.value})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
            >
              <option value="normal">正态分布</option>
              <option value="uniform">均匀分布</option>
              <option value="exponential">指数分布</option>
              <option value="poisson">泊松分布</option>
            </select>
          </div>
          
          {distributionParams.type === 'normal' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">均值</label>
                <input
                  type="number"
                  value={distributionParams.mean}
                  onChange={(e) => setDistributionParams({...distributionParams, mean: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">标准差</label>
                <input
                  type="number"
                  min="0"
                  value={distributionParams.stdDev}
                  onChange={(e) => setDistributionParams({...distributionParams, stdDev: parseFloat(e.target.value) || 1})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>
            </div>
          )}
          
          {distributionParams.type === 'uniform' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">最小值</label>
                <input
                  type="number"
                  value={distributionParams.min}
                  onChange={(e) => setDistributionParams({...distributionParams, min: parseFloat(e.target.value) || 0})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">最大值</label>
                <input
                  type="number"
                  value={distributionParams.max}
                  onChange={(e) => setDistributionParams({...distributionParams, max: parseFloat(e.target.value) || 100})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
                />
              </div>
            </div>
          )}
          
          {distributionParams.type === 'exponential' && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">速率参数 (λ)</label>
              <input
                type="number"
                min="0"
                value={distributionParams.rate}
                onChange={(e) => setDistributionParams({...distributionParams, rate: parseFloat(e.target.value) || 1})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
              />
            </div>
          )}
          
          {distributionParams.type === 'poisson' && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">λ 参数</label>
              <input
                type="number"
                min="0"
                value={distributionParams.lambda}
                onChange={(e) => setDistributionParams({...distributionParams, lambda: parseFloat(e.target.value) || 5})}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
              />
            </div>
          )}
          
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">样本大小</label>
            <input
              type="number"
              min="1"
              value={distributionParams.size}
              onChange={(e) => setDistributionParams({...distributionParams, size: parseInt(e.target.value) || 100})}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
            />
          </div>
          
          <div className="flex gap-4">
            <button 
                onClick={() => generateDistributionData(distributionParams.type, {
                  count: distributionParams.size,
                  mean: distributionParams.mean,
                  stdDev: distributionParams.stdDev,
                  min: distributionParams.min,
                  max: distributionParams.max,
                  lambda: distributionParams.type === 'exponential' ? distributionParams.rate : distributionParams.lambda
                })}
                disabled={loading}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1'}`}
              >
                🎲 生成数据
              </button>
            <button 
              onClick={clearData}
              className="px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 shadow-md hover:-translate-y-1"
            >
              🗑️ 清除
            </button>
          </div>
        </div>
      )}
      
      {/* AI 生成面板 - 现代化设计，针对中国用户优化 */}
      {inputMethod === 'ai' && (
        <div className="space-y-6 fade-in">
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              <span className="font-semibold text-amber-500">重要提示：</span>
              此功能使用阿里云DashScope API提供AI数据生成能力。在中国网络环境下，您需要：
            </p>
            <ul className="list-disc pl-6 text-sm text-gray-600 mb-4 space-y-1">
              <li>1. 确保您的网络可以访问阿里云服务</li>
              <li>2. 提供有效的DashScope API密钥（不会被发送到我们的服务器）</li>
              <li>3. 如遇到访问问题，系统会自动切换到本地模拟数据</li>
            </ul>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-blue-700">
                🔑 <strong>获取API密钥：</strong>
                <a href="https://dashscope.console.aliyun.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                  前往阿里云DashScope控制台
                </a> - 注册账号、完成实名认证、开通服务并获取API密钥
              </p>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="px-4 py-2 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all duration-300"
              >
                {showApiKeyInput ? '隐藏API密钥' : '设置API密钥'}
              </button>
            </div>
            
            {showApiKeyInput && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  DashScope API密钥
                </label>
                <div className="relative">
                  <input
                    type={apiKeyVisible ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem('dashScopeApiKey', e.target.value);
                    }}
                    placeholder="请输入DashScope API密钥"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setApiKeyVisible(!apiKeyVisible)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                    aria-label={apiKeyVisible ? "隐藏密钥" : "显示密钥"}
                  >
                    {apiKeyVisible ? "👁️‍🗨️" : "👁️"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  🔒 您的API密钥仅存储在本地浏览器中，不会被发送到我们的服务器
                </p>
              </div>
            )}
            
            <label className="block text-sm font-medium text-gray-700 mb-2">数据描述</label>
            <textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="请描述您想要生成的数据..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:ring-primary focus:border-primary transition-all duration-300"
            ></textarea>
            
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">提示词建议：</p>
              <div className="flex flex-wrap gap-2">
                {aiPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setAiPrompt(prompt)}
                    className="px-3 py-1 rounded-xl bg-gray-100 text-sm text-gray-700 hover:bg-gray-200 transition-all duration-300"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button 
                onClick={() => {
                  // 保存API密钥到localStorage
                  if (apiKey) {
                    localStorage.setItem('dashScopeApiKey', apiKey);
                  }
                  generateDataWithAI(aiPrompt);
                }}
                disabled={!apiKey || loading}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${!apiKey || loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1'}`}
              >
                🤖 生成数据
              </button>
            <button 
              onClick={clearData}
              className="px-6 py-3 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300 shadow-md hover:-translate-y-1"
            >
              🗑️ 清除
            </button>
          </div>
          
          {/* 数据统计摘要 - 只有在有数据时显示 */}
          {data && data.length > 0 && (
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mt-6">
              <h3 className="text-lg font-semibold mb-3">数据统计摘要</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">样本大小</p>
                  <p className="font-medium">{data.length}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">均值</p>
                  <p className="font-medium">{(data.reduce((sum, point) => sum + point.value, 0) / data.length).toFixed(4)}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">标准差</p>
                  <p className="font-medium">{(() => {
                    const mean = data.reduce((sum, point) => sum + point.value, 0) / data.length;
                    const variance = data.reduce((sum, point) => sum + Math.pow(point.value - mean, 2), 0) / data.length;
                    return Math.sqrt(variance).toFixed(4);
                  })()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <p className="text-sm text-gray-500">范围</p>
                  <p className="font-medium">{(() => {
                    const values = data.map(point => point.value);
                    return `${Math.min(...values).toFixed(4)} - ${Math.max(...values).toFixed(4)}`;
                  })()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DataInputPanel;