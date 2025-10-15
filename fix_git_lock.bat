@echo off
cls
echo 正在解决Git锁定文件问题...
echo 注意：请确保在项目文件夹中运行此脚本！
echo.

rem 检查是否在用户目录下运行Git命令(这是错误的位置)
set "CURRENT_DIR=%CD%"
if "%CURRENT_DIR%" == "%USERPROFILE%" (
    echo 错误：您正在用户目录(C:\Users\%USERNAME%)中运行Git命令！
    echo 这是不正确的做法，请按照以下步骤操作：
    echo 1. 关闭当前Git窗口
    echo 2. 打开文件资源管理器，导航到项目文件夹
    echo    C:\Users\%USERNAME%\Documents\Trea CN\statistical-webapp
    echo 3. 在项目文件夹中右键点击，选择"Git Bash Here"
    echo 4. 然后在那里运行Git命令
    echo.
    echo 或者：双击运行此脚本，它会尝试修复锁定问题
    pause
)

rem 检查当前目录是否有.git文件夹
if not exist ".git" (
    echo 警告：当前目录不是Git仓库！
    echo 尝试删除用户目录中的锁定文件...
    echo.
    
    rem 尝试删除用户目录中的index.lock文件
    if exist "%USERPROFILE%\.git\index.lock" (
        echo 发现用户目录中的index.lock文件，正在删除...
        del "%USERPROFILE%\.git\index.lock" /f /q
        if %errorlevel% equ 0 (
            echo 成功删除用户目录中的index.lock文件！
        ) else (
            echo 警告：无法删除用户目录中的index.lock文件，可能需要管理员权限。
            echo 请手动删除：C:\Users\%USERNAME%\.git\index.lock
        )
    ) else (
        echo 未发现用户目录中的index.lock文件。
    )
) else (
    rem 尝试删除项目目录中的index.lock文件
    if exist ".git\index.lock" (
        echo 发现项目目录中的index.lock文件，正在删除...
        del ".git\index.lock" /f /q
        if %errorlevel% equ 0 (
            echo 成功删除项目目录中的index.lock文件！
        ) else (
            echo 警告：无法删除项目目录中的index.lock文件，可能需要管理员权限。
            echo 请尝试右键点击此脚本并选择"以管理员身份运行"。
        )
    ) else (
        echo 未发现项目目录中的index.lock文件。
    )
)

echo.
echo =====================================================
echo Git锁定问题修复完成！
echo 重要提示：请确保在正确的项目目录中运行Git命令：
echo C:\Users\%USERNAME%\Documents\Trea CN\statistical-webapp
echo 现在您可以尝试重新运行 git add . 和 git commit 命令。
echo =====================================================
echo.
pause