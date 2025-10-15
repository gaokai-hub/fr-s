<#
PowerShell开发服务器启动脚本
此脚本提供了比批处理文件更可靠的方式来启动开发服务器
保留完整的错误信息和日志，确保窗口不会意外关闭
#>

# 设置中文编码
$OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()

# 显示欢迎信息
Clear-Host
Write-Host "===== 统计Web应用开发服务器启动器 ====="
Write-Host "PowerShell版本 - 提供更可靠的启动体验"
Write-Host "当前时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "=" * 50

# 1. 检查Node.js和npm安装情况
Write-Host "[步骤1] 检查Node.js和npm环境..."
Try {
    $nodeVersion = & node -v 2>$null
    if (-not $nodeVersion) {
        throw "未找到Node.js，请先安装Node.js。"
    }
    
    $npmVersion = & npm -v 2>$null
    if (-not $npmVersion) {
        throw "未找到npm，请安装Node.js或修复npm路径。"
    }
    
    Write-Host "✓ Node.js版本: $nodeVersion"
    Write-Host "✓ npm版本: $npmVersion"
} Catch {
    Write-Host "✗ 错误: $_" -ForegroundColor Red
    Write-Host "请确保已正确安装Node.js并配置好环境变量。"
    Pause
    exit 1
}

# 2. 确认当前目录
Write-Host "\n[步骤2] 检查项目目录..."
$currentDir = Get-Location
Write-Host "当前目录: $currentDir"

# 3. 安装依赖检查
Write-Host "\n[步骤3] 检查项目依赖..."
if (-not (Test-Path -Path "./node_modules" -PathType Container)) {
    Write-Host "检测到node_modules文件夹不存在，将安装依赖..."
    Try {
        Write-Host "正在执行: npm install"
        & npm install
        if ($LASTEXITCODE -ne 0) {
            throw "npm install 命令执行失败，错误代码: $LASTEXITCODE"
        }
        Write-Host "✓ 依赖安装成功!"
    } Catch {
        Write-Host "✗ 依赖安装失败: $_" -ForegroundColor Red
        Write-Host "常见问题排查:"
        Write-Host "1. 检查网络连接是否正常"
        Write-Host "2. 尝试使用管理员权限运行此脚本"
        Write-Host "3. 清理npm缓存: npm cache clean --force"
        Pause
        exit 1
    }
} else {
    Write-Host "✓ node_modules已存在，跳过依赖安装。"
}

# 4. 启动开发服务器
Write-Host "\n[步骤4] 启动开发服务器..."
Write-Host "正在执行: npm run dev"
Write-Host "=" * 50
Write-Host "服务器启动日志:"

Try {
    # 启动开发服务器并捕获输出
    & npm run dev
    
    # 检查命令执行结果
    if ($LASTEXITCODE -ne 0) {
        throw "开发服务器启动失败，错误代码: $LASTEXITCODE"
    }
} Catch {
    Write-Host "=" * 50 -ForegroundColor Red
    Write-Host "✗ 开发服务器启动失败: $_" -ForegroundColor Red
    Write-Host "=" * 50 -ForegroundColor Red
    Write-Host "\n问题排查建议:"
    Write-Host "1. 检查main.tsx文件是否存在且配置正确"
    Write-Host "2. 检查是否有其他程序占用了5173端口"
    Write-Host "3. 尝试重新安装依赖: npm install"
    Write-Host "4. 查看详细错误日志以确定具体问题"
}

# 保持窗口打开
Write-Host "\n按任意键退出..."
$null = $Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')