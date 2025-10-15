# 统计分布可视化工具

一个基于 React 和 TypeScript 构建的交互式统计分布可视化应用，帮助用户理解和探索不同概率分布的特性。

## 功能特性

- **多种概率分布**：支持正态分布、二项分布和泊松分布
- **实时参数调整**：通过直观的滑块和输入框调整分布参数
- **动态可视化**：实时更新图表，直观展示参数变化对分布形状的影响
- **响应式设计**：适配不同屏幕尺寸的设备
- **暗色/亮色主题**：根据系统设置自动切换主题

## 技术栈

- **前端框架**：React 18
- **编程语言**：TypeScript
- **构建工具**：Vite
- **图表库**：Recharts
- **数学计算**：mathjs

## 项目结构

```
statistical-webapp/
├── public/               # 静态资源文件
├── src/                  # 源代码目录
│   ├── components/       # React 组件
│   ├── hooks/            # 自定义 React Hooks
│   ├── services/         # 业务逻辑服务
│   │   └── calculations/ # 统计计算相关代码
│   ├── types/            # TypeScript 类型定义
│   ├── contexts/         # React Context
│   ├── App.tsx           # 应用入口组件
│   ├── main.tsx          # 程序入口文件
│   └── style.css         # 全局样式
├── package.json          # 项目依赖配置
├── tsconfig.json         # TypeScript 配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目文档
```

## 安装和运行

### 前置要求

- Node.js 16.x 或更高版本
- npm 7.x 或更高版本

### 安装依赖

```bash
# 进入项目目录
cd statistical-webapp

# 安装依赖
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 http://localhost:5173 启动。

### 构建生产版本

```bash
npm run build
```

构建后的文件将位于 `dist` 目录中。

### 预览生产版本

```bash
npm run preview
```

## 使用指南

1. 打开应用后，默认显示正态分布的可视化图表
2. 使用顶部的下拉菜单切换不同的分布类型（正态分布、二项分布、泊松分布）
3. 根据所选分布类型，调整相应的参数（如均值、方差、成功概率等）
4. 图表会实时更新，展示参数变化对分布形状的影响
5. 将鼠标悬停在图表上可以查看具体的数据点值

## 分布类型和参数说明

### 正态分布 (Normal Distribution)
- **均值 (μ)**：控制分布的中心位置
- **方差 (σ²)**：控制分布的离散程度（方差越大，分布越分散）

### 二项分布 (Binomial Distribution)
- **试验次数 (n)**：独立试验的次数
- **成功概率 (p)**：单次试验成功的概率

### 泊松分布 (Poisson Distribution)
- **λ 参数**：单位时间内事件发生的平均次数

## 开发指南

### 添加新的概率分布

1. 在 `src/types/distribution.ts` 中添加新的分布类型和参数接口
2. 在 `src/services/calculations/distributionCalculations.ts` 中实现分布的概率密度/质量函数和数据生成函数
3. 在 `src/hooks/useDistribution.ts` 中添加新分布的状态管理逻辑
4. 更新 `src/components/ProbabilityDistribution.tsx` 以支持新分布的参数控制界面

### 代码规范

- 遵循 TypeScript 的类型安全原则，为所有函数和变量添加类型注解
- 组件采用函数式组件和 React Hooks
- 业务逻辑与 UI 组件分离，封装在 services 和 hooks 中
- 使用 ESLint 和 Prettier 保持代码风格一致

## 贡献

欢迎提交问题和改进建议。如有重大更改，请先创建 issue 讨论更改内容。

## 许可证

MIT

## 致谢

本项目使用了以下开源库：
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [Recharts](https://recharts.org/)
- [mathjs](https://mathjs.org/)