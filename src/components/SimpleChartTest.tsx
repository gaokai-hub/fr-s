import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const SimpleChartTest: React.FC = () => {
  // 最简单的静态数据
  const data = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 30 },
    { name: 'D', value: 40 },
    { name: 'E', value: 50 }
  ];

  return (
    <div style={{ height: '400px', width: '100%', border: '1px solid #ccc', padding: '20px' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>简单图表测试</h2>
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SimpleChartTest;