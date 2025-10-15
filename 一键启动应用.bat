@echo off
chcp 65001 >nul
cd /d "%~dp0"
cls

:start
color 0A
echo ===============================================================================
echo                         统计学习工具 - 一键启动器
echo ===============================================================================
echo.
echo 此脚本将直接启动开发服务器，无需复杂设置
echo 注意：请确保已安装Node.js环境
echo.
echo 正在检查Node.js...
node -v >nul 2>nul
if %errorlevel% neq 0 (
echo.
echo 错误: 未找到Node.js。请先安装Node.js。
echo 下载地址: https://nodejs.org/zh-cn/download/
echo.
echo 按任意键退出...
pause >nul
exit /b 1
)
echo.
echo 正在启动开发服务器...
echo ===============================================================================
echo.
echo 开发服务器启动后，您可以在浏览器中访问：
echo http://localhost:5173/
echo.
echo 按 Ctrl+C 可以停止开发服务器。
echo.

:: 直接启动开发服务器
npm run dev

:: 处理退出
if %errorlevel% neq 0 (
echo.
echo 错误: 开发服务器启动失败。
echo 尝试手动安装必要依赖：
echo npm install @vitejs/plugin-react --save-dev
echo.
echo 按任意键退出...
pause >nul
exit /b %errorlevel%
)
echo.
echo 开发服务器已停止。
echo 按任意键退出...
pause >nul