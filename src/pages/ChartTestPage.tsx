import React from 'react';
import BasicStatistics from '../components/BasicStatistics';
import { useData } from '../contexts/DataContext';

const ChartTestPage: React.FC = () => {
  const { setData } = useData();
  
  // 初始化测试数据
  React.useEffect(() => {
    const testData = [10, 15, 25, 20, 8, 12, 18, 22, 30, 15, 25, 28, 17, 21, 19];
    // 转换为DataPoint格式
    const dataPoints = testData.map((value, index) => ({
      id: index.toString(),
      value: value
    }));
    setData(dataPoints);
  }, [setData]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">图表测试页面</h1>
      
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-bold mb-4">BasicStatistics 组件测试</h2>
        
        {/* 直接使用 BasicStatistics 组件 */}
        <BasicStatistics />
      </div>
    </div>
  );
};

export default ChartTestPage;