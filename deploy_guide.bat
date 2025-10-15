@echo off
cls
echo =========================================================
echo 统计Web应用部署指南
echo =========================================================
echo.
echo 发现您的系统尚未安装Git，这是部署到GitHub Pages的必要工具。
echo.
echo 请按照以下步骤操作：
echo 1. 访问 https://git-scm.com/download/win 下载Git安装程序
echo 2. 安装Git时，请确保勾选"Add Git to PATH"选项
echo 3. 安装完成后，重启计算机以确保环境变量生效
echo 4. 重新运行此脚本继续部署

echo.
echo 等待5秒后，脚本将尝试安装Git（如果您已下载）...
echo 或者按任意键退出

timeout /t 5 >nul

REM 检查是否已下载Git安装程序
if exist "%USERPROFILE%\Downloads\Git-*-64-bit.exe" (
    echo 找到Git安装程序，正在安装...
    "%USERPROFILE%\Downloads\Git-*-64-bit.exe" /SILENT /COMPONENTS="icons,icons\quicklaunch,assoc,assoc_sh"
    echo Git安装完成，请重启计算机后重试。
) else (
    echo 未找到Git安装程序，请手动下载并安装。
)

echo.
echo 按任意键退出...
pause >nul