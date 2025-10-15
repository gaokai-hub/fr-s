@echo off

REM 设置控制台编码为UTF-8
chcp 65001 >nul

REM 更改到当前目录
cd /d %~dp0

REM 输出欢迎信息
cls
echo ===================================================
echo              统计学习工具 - 启动脚本
echo ===================================================
echo.
echo 正在准备启动开发服务器...
echo.

REM 检查是否已安装依赖
if not exist node_modules (
    echo 检测到未安装依赖，正在安装...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败，请检查网络连接并重试。
        pause
        exit /b %errorlevel%
    )
)

REM 启动开发服务器
echo 依赖已就绪，正在启动开发服务器...
echo.
echo 开发服务器启动后，您可以在浏览器中访问：
echo http://localhost:5173/
echo.
echo 按 Ctrl+C 可以停止开发服务器。
echo.
npm run dev

REM 处理退出
if %errorlevel% neq 0 (
    echo.
echo 开发服务器启动失败。
    echo 常见问题：如果出现关于插件的错误，请尝试手动安装：
    echo npm install @vitejs/plugin-react --save-dev
    pause
    exit /b %errorlevel%
)

pause