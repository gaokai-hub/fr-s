<#
统计学习工具 - 启动脚本（修复版）
此脚本使用PowerShell编写，确保正确的UTF-8编码和可靠的错误处理
#>

# 强制使用UTF-8编码
$OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
[Console]::InputEncoding = [System.Text.UTF8Encoding]::new()

# 清屏并显示欢迎信息
Clear-Host
Write-Host "===== 统计学习工具启动器 ======" -ForegroundColor Green
Write-Host "当前时间: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
Write-Host "脚本路径: $PSScriptRoot"
Write-Host "=" * 40

# 1. 检查Node.js环境
Write-Host "[步骤1] 检查Node.js环境..." -ForegroundColor Cyan
Try {
    $nodeVersion = & node -v 2>$null
    if (-not $nodeVersion) {
        throw "未找到Node.js"
    }
    Write-Host "✓ Node.js版本: $nodeVersion"
} Catch {
    Write-Host "❌ 错误: 未找到Node.js。请先安装Node.js。" -ForegroundColor Red
    Write-Host "您可以从 https://nodejs.org/zh-cn/download/ 下载并安装"
    Read-Host "按Enter键退出..."
    exit 1
}

# 2. 检查npm环境
Write-Host "[步骤2] 检查npm环境..." -ForegroundColor Cyan
Try {
    $npmVersion = & npm -v 2>$null
    if (-not $npmVersion) {
        throw "未找到npm"
    }
    Write-Host "✓ npm版本: $npmVersion"
} Catch {
    Write-Host "❌ 错误: 未找到npm。请确保Node.js安装正确。" -ForegroundColor Red
    Read-Host "按Enter键退出..."
    exit 1
}

# 3. 检查并安装依赖
Write-Host "[步骤3] 检查项目依赖..." -ForegroundColor Cyan
$nodeModulesPath = Join-Path -Path $PSScriptRoot -ChildPath "node_modules"
if (-not (Test-Path -Path $nodeModulesPath)) {
    Write-Host "⚠️ 未找到node_modules目录，准备安装依赖..."
    Try {
        Write-Host "正在执行: npm install"
        & npm install
        if ($LASTEXITCODE -ne 0) {
            throw "依赖安装失败"
        }
        Write-Host "✓ 依赖安装成功"
    } Catch {
        Write-Host "❌ 错误: 依赖安装失败。请检查网络连接并重试。" -ForegroundColor Red
        Write-Host "如果仍然失败，可以尝试手动执行: npm install @vitejs/plugin-react --save-dev"
        Read-Host "按Enter键退出..."
        exit 1
    }
} else {
    Write-Host "✓ 依赖已存在，跳过安装步骤"
}

# 4. 启动开发服务器
Write-Host "[步骤4] 启动开发服务器..." -ForegroundColor Cyan
Write-Host "开发服务器启动后，可以在浏览器中访问:"
Write-Host "http://localhost:5173/" -ForegroundColor Yellow
Write-Host "注意：按Ctrl+C可以停止开发服务器"
Write-Host "=" * 40

Try {
    & npm run dev
    if ($LASTEXITCODE -ne 0) {
        throw "开发服务器启动失败"
    }
} Catch {
    Write-Host "❌ 错误: 开发服务器启动失败。" -ForegroundColor Red
    Write-Host "可能的解决方案:"
    Write-Host "1. 手动安装React插件: npm install @vitejs/plugin-react --save-dev"
    Write-Host "2. 清理缓存后重试: npm cache clean --force && npm install"
    Write-Host "3. 检查端口5173是否被占用"
    Read-Host "按Enter键退出..."
    exit 1
}

# 脚本结束
Read-Host "按Enter键退出..."