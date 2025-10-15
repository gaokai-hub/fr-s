import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: 'blue', textAlign: 'center' }}>测试页面</h1>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: 'lightyellow', 
        border: '2px solid orange',
        borderRadius: '8px'
      }}>
        <h2 style={{ color: 'green' }}>简单元素测试</h2>
        
        {/* 彩色方块测试 */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginTop: '10px',
          marginBottom: '20px'
        }}>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'red' }}></div>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'blue' }}></div>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'green' }}></div>
          <div style={{ width: '50px', height: '50px', backgroundColor: 'purple' }}></div>
        </div>
        
        {/* 简单表格测试 */}
        <table style={{ 
          width: '100%', 
          borderCollapse: 'collapse', 
          marginTop: '10px'
        }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>名称</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>数值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>A</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>10</td>
            </tr>
            <tr style={{ backgroundColor: '#f9f9f9' }}>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>B</td>
              <td style={{ padding: '12px', border: '1px solid #ddd' }}>20</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      {/* 简单的模拟图表区域 */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: 'lightblue', 
        border: '2px solid blue',
        borderRadius: '8px',
        height: '300px'
      }}>
        <h2 style={{ color: 'purple' }}>图表测试区域</h2>
        
        {/* 简单的条形图模拟 */}
        <div style={{ 
          height: '200px', 
          display: 'flex', 
          alignItems: 'flex-end', 
          justifyContent: 'space-around',
          marginTop: '20px'
        }}>
          {[10, 15, 25, 20, 8].map((value, index) => (
            <div key={index} style={{ 
              width: '15%',
              height: `${value * 8}px`,
              backgroundColor: '#3b82f6',
              border: '1px solid #2563eb',
              borderRadius: '4px 4px 0 0',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              paddingTop: '5px',
              color: 'white',
              fontSize: '12px'
            }}>
              {value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestPage;