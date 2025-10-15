import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface HistogramProps {
  data: { name: string; value: number }[];
  title?: string;
  color?: string;
}

export const Histogram: React.FC<HistogramProps> = ({ 
  data, 
  title = '统计直方图', 
  color = '#3b82f6' 
}) => {
  // 提供硬编码的示例数据用于测试
  const exampleData = [
    { name: '1-20', value: 15 },
    { name: '21-40', value: 25 },
    { name: '41-60', value: 35 },
    { name: '61-80', value: 20 },
    { name: '81-100', value: 10 }
  ];
  
  // 优先使用传入的数据，否则使用示例数据
  const chartData = (data && data.length > 0) ? data : exampleData;
  
  return (
    <div style={{ height: '400px', width: '100%', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px' }}>
      {title && <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>{title}</h2>}
      
      <div style={{ height: '320px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e2e8f0' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                color: '#1f2937'
              }}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill={color} 
              name="数值"
              radius={[8, 8, 0, 0]}
              barSize={40}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Histogram;