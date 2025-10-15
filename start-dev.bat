@echo off
cd /d %~dp0

REM 检查Node.js是否安装
where node >nul 2>nul
if %errorlevel% neq 0 (
echo 错误: 未找到Node.js。请先安装Node.js。
pause
exit /b 1
)

REM 尝试直接使用Node.js启动开发服务器
node node_modules\vite\bin\vite.js

REM 如果上面的命令失败，尝试npm run dev但使用cmd.exe执行
if %errorlevel% neq 0 (
echo 尝试使用npm run dev...
cmd /c "npm run dev"
)

pause