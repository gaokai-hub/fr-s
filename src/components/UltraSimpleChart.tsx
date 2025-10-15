import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const UltraSimpleChart: React.FC = () => {
  // 最简单的静态数据
  const data = [
    { name: 'Jan', value: 10 },
    { name: 'Feb', value: 20 },
    { name: 'Mar', value: 30 },
    { name: 'Apr', value: 25 },
    { name: 'May', value: 40 }
  ];

  return (
    <div style={{ 
      height: '400px', 
      width: '800px', 
      border: '1px solid black', 
      backgroundColor: 'white',
      margin: '20px auto',
      padding: '20px'
    }}>
      <h2 style={{ textAlign: 'center' }}>超简单图表测试</h2>
      <div style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UltraSimpleChart;