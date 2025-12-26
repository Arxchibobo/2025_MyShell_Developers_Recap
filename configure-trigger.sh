#!/bin/bash

# 配置 Cloud Build 触发器脚本
# 此脚本会自动添加 GEMINI_API_KEY 环境变量到 Cloud Build 触发器

set -e

echo "🔧 配置 Cloud Build 触发器..."
echo ""

# 检查是否已登录
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo "❌ 未登录 Google Cloud，请先运行："
    echo "   gcloud auth login"
    exit 1
fi

# 获取项目 ID
PROJECT_ID=$(gcloud config get-value project)
echo "📋 当前项目: $PROJECT_ID"
echo ""

# 列出所有触发器
echo "📡 获取触发器列表..."
TRIGGERS=$(gcloud builds triggers list --format="value(name,id)" 2>&1)

if [ $? -ne 0 ]; then
    echo "❌ 获取触发器列表失败"
    echo "$TRIGGERS"
    exit 1
fi

echo "找到的触发器:"
echo "$TRIGGERS"
echo ""

# 提示用户选择触发器
echo "请输入触发器名称（如果只有一个，按回车使用默认）："
read TRIGGER_NAME

if [ -z "$TRIGGER_NAME" ]; then
    # 自动使用第一个触发器
    TRIGGER_NAME=$(echo "$TRIGGERS" | head -1 | awk '{print $1}')
    echo "✅ 使用触发器: $TRIGGER_NAME"
fi

# 获取触发器 ID
TRIGGER_ID=$(echo "$TRIGGERS" | grep "$TRIGGER_NAME" | awk '{print $2}')

if [ -z "$TRIGGER_ID" ]; then
    echo "❌ 未找到触发器: $TRIGGER_NAME"
    exit 1
fi

echo "📝 触发器 ID: $TRIGGER_ID"
echo ""

# API Key
API_KEY="AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc"

echo "🔐 配置环境变量..."
echo "   变量名: _GEMINI_API_KEY"
echo "   值: $API_KEY"
echo ""

# 使用 gcloud 命令更新触发器
echo "⏳ 正在更新触发器配置..."

# 导出当前配置
gcloud builds triggers export $TRIGGER_ID --destination=/tmp/trigger-config.yaml

# 检查是否已存在 substitutions
if ! grep -q "substitutions:" /tmp/trigger-config.yaml; then
    # 添加 substitutions 部分
    echo "substitutions:" >> /tmp/trigger-config.yaml
fi

# 添加或更新 _GEMINI_API_KEY
if grep -q "_GEMINI_API_KEY:" /tmp/trigger-config.yaml; then
    # 更新现有值
    sed -i "s|_GEMINI_API_KEY:.*|_GEMINI_API_KEY: $API_KEY|g" /tmp/trigger-config.yaml
else
    # 添加新值
    echo "  _GEMINI_API_KEY: $API_KEY" >> /tmp/trigger-config.yaml
fi

# 导入更新后的配置
gcloud builds triggers import --source=/tmp/trigger-config.yaml

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 触发器配置成功！"
    echo ""
    echo "📋 下一步："
    echo "1. 手动触发构建："
    echo "   gcloud builds triggers run $TRIGGER_NAME --branch=main"
    echo ""
    echo "2. 或推送新 commit 自动触发："
    echo "   git commit --allow-empty -m 'chore: trigger rebuild'"
    echo "   git push"
    echo ""
    echo "3. 等待构建完成（约 5-10 分钟）"
    echo "4. 访问你的 Cloud Run 服务 URL 验证"
else
    echo ""
    echo "❌ 配置失败，请手动在控制台配置："
    echo "   https://console.cloud.google.com/cloud-build/triggers"
fi
