@echo off
chcp 65001 >nul
title 口语交际比赛系统

echo ========================================
echo        口语交际比赛比赛系统
echo ========================================
echo.

:: 检查Python是否安装
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未检测到Python，请先安装Python
    echo 下载地址：https://www.python.org/downloads/
    echo.
    pause
    exit /b 1
)

:: 获取当前目录
set CURRENT_DIR=%~dp0

:: 启动HTTP服务器
echo [1/2] 启动本地服务...
start "比赛系统服务" cmd /c "cd /d %CURRENT_DIR% && python -m http.server 8080 > nul 2>&1"

:: 等待1秒
timeout /t 1 /nobreak >nul

:: 打开浏览器
echo [2/2] 打开浏览器...
start http://localhost:8080/index.html

echo.
echo ========================================
echo   系统已启动！
echo   后台管理地址：http://localhost:8080/admin.html
echo   比赛地址：http://localhost:8080/index.html
echo ========================================
echo.
echo 关闭此窗口即可停止服务
echo.
pause
