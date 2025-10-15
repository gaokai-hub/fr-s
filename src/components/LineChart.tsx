import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface LineChartProps {
  data: { name: string; value: number }[];
  title?: string;
  color?: string;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title = '统计折线图', 
  color = 'var(--primary-color)' 
}) => {
  // 提供硬编码的示例数据用于测试
  const exampleData = [
    { name: '1', value: 10 },
    { name: '2', value: 15 },
    { name: '3', value: 25 },
    { name: '4', value: 20 },
    { name: '5', value: 30 },
    { name: '6', value: 35 },
    { name: '7', value: 28 },
    { name: '8', value: 40 },
    { name: '9', value: 32 },
    { name: '10', value: 45 }
  ];
  
  // 优先使用传入的数据，否则使用示例数据
  const chartData = (data && data.length > 0) ? data : exampleData;
  
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-xl font-bold mb-4 text-text-primary">{title}</h3>}
      
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--border-color)" 
              opacity={0.3} 
            />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={{ stroke: 'var(--border-color)' }}
            />
            <YAxis 
              tick={{ fill: 'var(--text-secondary)' }}
              axisLine={{ stroke: 'var(--border-color)' }}
              tickLine={{ stroke: 'var(--border-color)' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--surface)',
                borderColor: 'var(--border-color)',
                borderRadius: '0.75rem',
                color: 'var(--text-primary)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '0.75rem 1rem',
                border: '1px solid var(--border-color)'
              }}
              itemStyle={{
                padding: '0.25rem 0',
                color: 'var(--text-primary)'
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--text-primary)',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '0.5rem'
              }}
            />
            <Legend 
              wrapperStyle={{
                paddingTop: '1rem'
              }}
              iconType="circle"
            />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color} 
              name="数值"
              strokeWidth={3}
              dot={{
                stroke: color, 
                strokeWidth: 2, 
                r: 5, 
                fill: 'var(--surface)'
              }}
              activeDot={{
                r: 8, 
                stroke: color, 
                strokeWidth: 2, 
                fill: color,
                strokeDasharray: '0'
              }}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LineChart;