import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 完全独立的图表测试组件
const IsolatedChartTest: React.FC = () => {
  // 静态测试数据
  const data = [
    { name: 'Mon', sales: 4000, revenue: 2400 },
    { name: 'Tue', sales: 3000, revenue: 1398 },
    { name: 'Wed', sales: 2000, revenue: 9800 },
    { name: 'Thu', sales: 2780, revenue: 3908 },
    { name: 'Fri', sales: 1890, revenue: 4800 },
    { name: 'Sat', sales: 2390, revenue: 3800 },
    { name: 'Sun', sales: 3490, revenue: 4300 },
  ];

  // 内联样式，不依赖外部CSS
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    padding: '20px',
    fontFamily: 'Arial, sans-serif'
  };

  const chartContainerStyle = {
    width: '100%',
    height: '400px',
    border: '1px solid #ccc',
    padding: '20px',
    boxSizing: 'border-box' as const
  };

  const titleStyle = {
    textAlign: 'center' as const,
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px'
  };

  return (
    <React.StrictMode>
      <div style={containerStyle}>
        <h1 style={titleStyle}>独立图表测试 - 完全不依赖外部样式</h1>
        <div style={chartContainerStyle}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <p>如果您能看到上面的柱状图，说明Recharts图表渲染正常。</p>
        </div>
      </div>
    </React.StrictMode>
  );
};

export default IsolatedChartTest;