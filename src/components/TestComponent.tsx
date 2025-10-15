import React from 'react';

const TestComponent: React.FC = () => {
  return (
    <div style={{
      padding: '40px',
      textAlign: 'center',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#333' }}>React测试组件</h1>
      <p style={{ fontSize: '18px', color: '#666' }}>这是一个简单的测试组件，用于验证React是否能正常工作</p>
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        display: 'inline-block'
      }}>
        <p style={{ color: '#4CAF50', fontSize: '20px' }}>✓ React渲染成功！</p>
        <p>如果您看到此消息，说明React环境配置正确</p>
      </div>
    </div>
  );
};

export default TestComponent;