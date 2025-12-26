#!/bin/bash

# MyShell 2025 年度回顾 - Cloud Function 部署脚本
#
# 使用说明：
# 1. 确保已安装 gcloud CLI 并登录
# 2. 确保已设置正确的 GCP 项目
# 3. 执行：bash deploy.sh YOUR_API_KEY
#
# 示例：bash deploy.sh AIzaSyC...

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   MyShell 2025 Cloud Function 部署工具   ${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 检查参数（可选，如果未提供则使用默认值）
if [ -z "$1" ]; then
  echo -e "${YELLOW}⚠️  未提供 API Key，使用配置的默认值${NC}"
  API_KEY="AIzaSyCsvye2kLGyQIdPAfBogsUf8ZXNO5qfZmg"
else
  API_KEY="$1"
fi
PROJECT_ID="gen-lang-client-0260270819"
REGION="europe-west1"
FUNCTION_NAME="generate-content"

echo -e "${YELLOW}📋 部署配置：${NC}"
echo "  项目 ID: $PROJECT_ID"
echo "  区域: $REGION"
echo "  函数名称: $FUNCTION_NAME"
echo "  API Key 长度: ${#API_KEY} 字符"
echo ""

# 确认部署
read -p "确认部署？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}⏸️  已取消部署${NC}"
  exit 0
fi

echo ""
echo -e "${BLUE}🚀 开始部署...${NC}"
echo ""

# 自动确认（CI/CD 友好）
export CLOUDSDK_CORE_DISABLE_PROMPTS=1

# 部署 Cloud Function
gcloud functions deploy "$FUNCTION_NAME" \
  --gen2 \
  --runtime=nodejs20 \
  --region="$REGION" \
  --source=. \
  --entry-point=generateContent \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY="$API_KEY" \
  --memory=512MB \
  --timeout=60s \
  --max-instances=10 \
  --project="$PROJECT_ID"

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 部署完成！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📍 函数 URL：${NC}"
echo "  https://$REGION-$PROJECT_ID.cloudfunctions.net/$FUNCTION_NAME"
echo ""
echo -e "${YELLOW}🔍 查看日志：${NC}"
echo "  gcloud functions logs read $FUNCTION_NAME --region=$REGION --project=$PROJECT_ID"
echo ""
echo -e "${YELLOW}📝 测试调用：${NC}"
echo '  curl -X POST https://'"$REGION"'-'"$PROJECT_ID"'.cloudfunctions.net/'"$FUNCTION_NAME"' \'
echo '    -H "Content-Type: application/json" \'
echo '    -d '"'"'{"type":"thanks-letter","developerName":"测试","botCount":10,"topCategory":"AI"}'"'"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}下一步：修改前端代码调用此 URL${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
