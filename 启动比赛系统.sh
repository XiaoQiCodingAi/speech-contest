#!/bin/bash
chcp 65001 >/dev/null 2>&1

echo "========================================"
echo "       口语交际比赛比赛系统"
echo "========================================"
echo ""

# 检查Python
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "[错误] 未检测到Python，请先安装Python"
        echo "下载地址：https://www.python.org/downloads/"
        exit 1
    fi
    PYTHON_CMD=python
else
    PYTHON_CMD=python3
fi

CURRENT_DIR="$(cd "$(dirname "$0")" && pwd)"
PORT=8080

echo "[1/2] 启动本地服务..."
$PYTHON_CMD -m http.server $PORT --directory "$CURRENT_DIR" > /dev/null 2>&1 &
PID=$!

echo "[2/2] 打开浏览器..."
sleep 1
open "http://localhost:$PORT/index.html" 2>/dev/null || xdg-open "http://localhost:$PORT/index.html" 2>/dev/null || echo "请手动打开浏览器访问：http://localhost:$PORT/index.html"

echo ""
echo "========================================"
echo "  系统已启动！"
echo "  后台管理地址：http://localhost:$PORT/admin.html"
echo "  比赛地址：http://localhost:$PORT/index.html"
echo "========================================"
echo ""
echo "按 Enter 键停止服务"
read
kill $PID 2>/dev/null
