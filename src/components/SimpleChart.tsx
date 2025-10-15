import React from 'react';

// 最简单的图表组件 - 直接使用div模拟条形图
export const SimpleChart: React.FC = () => {
  // 简单的数据
  const data = [
    { name: 'A', value: 10 },
    { name: 'B', value: 20 },
    { name: 'C', value: 15 },
    { name: 'D', value: 25 },
    { name: 'E', value: 30 }
  ];

  // 计算最大高度用于归一化
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div style={{ 
      height: '300px', 
      width: '100%', 
      border: '2px solid green',
      backgroundColor: 'white',
      padding: '20px',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'space-around'
    }}>
      {data.map((item, index) => (
        <div key={index} style={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '15%'
        }}>
          <div 
            style={{ 
              width: '100%', 
              height: `${(item.value / maxValue) * 100}%`,
              backgroundColor: '#8884d8',
              marginBottom: '5px'
            }} 
          />
          <div style={{ fontSize: '12px' }}>{item.name}</div>
        </div>
      ))}
    </div>
  );
};

export default SimpleChart;