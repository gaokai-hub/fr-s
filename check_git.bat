@echo off
cls
echo 正在检查Git是否安装...
git --version
if %errorlevel% neq 0 (
    echo Git未找到，尝试使用完整路径...
    "C:\Program Files\Git\bin\git.exe" --version
    if %errorlevel% neq 0 (
        echo Git仍然未找到，请确认您已正确安装Git。
        echo 如果已安装，请尝试重启计算机以更新环境变量。
    ) else (
        echo Git已安装，但不在系统路径中。
    )
) else (
    echo Git已成功安装！
)
echo.
echo 按任意键退出...
pause >nul