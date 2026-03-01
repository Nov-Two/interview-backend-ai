#!/bin/bash

# 遇到错误立即退出
set -e

# 输出当前时间
echo "Starting deployment at $(date)"

# 1. 拉取最新代码
echo "Pulling latest code..."
git pull origin main

# 2. 重新构建并启动容器
echo "Rebuilding and restarting containers..."
docker-compose up -d --build

# 3. 清理未使用的镜像 (释放空间)
echo "Cleaning up..."
docker image prune -f

echo "Deployment finished successfully at $(date)"
