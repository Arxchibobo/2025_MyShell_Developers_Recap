# Cloud Functions 部署指南

本目录包含 MyShell 2025 年度回顾项目的 Cloud Function 后端代理实现。

## 📋 目录结构

```
functions/
└── generate-content/          # AI 内容生成函数
    ├── index.js               # 主函数代码
    ├── package.json           # 依赖配置
    ├── deploy.sh              # Linux/Mac 部署脚本
    ├── deploy.bat             # Windows 部署脚本
    └── README.md              # 本文档
```

## 🎯 功能说明

`generate-content` 函数提供两个核心功能：

1. **生成个性化感谢信**（文本）
   - 使用 Gemini 3 Flash Preview 模型
   - 基于开发者名称、Bot 数量和主要类别生成

2. **生成开发者头像**（图片）
   - 使用 Gemini 3 Pro Image Preview 模型
   - 返回 Base64 编码的 PNG 图片

## 🔐 安全优势

**为什么要使用 Cloud Function 代理？**

| 方案 | API Key 位置 | 安全性 | 维护成本 |
|------|------------|-------|---------|
| ❌ 前端直接调用 | 编译到 JavaScript 中 | **极低**（任何人都能提取） | 高（泄露后需重新构建） |
| ✅ Cloud Function 代理 | 服务端环境变量 | **高**（前端无法访问） | 低（只需更新环境变量） |

**关键保护措施：**
- ✅ API Key 永远不会出现在前端代码中
- ✅ 用户无法通过浏览器开发者工具提取 API Key
- ✅ 泄露 API Key 时无需重新构建整个网站
- ✅ 可以随时更新 API Key 而不影响前端

## 🚀 快速部署

### 前提条件

1. **安装 Google Cloud SDK**（gcloud CLI）
   ```bash
   # Linux/Mac
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL

   # Windows
   # 下载并安装：https://cloud.google.com/sdk/docs/install
   ```

2. **登录并设置项目**
   ```bash
   # 登录 Google Cloud
   gcloud auth login

   # 设置项目 ID
   gcloud config set project gen-lang-client-0260270819
   ```

3. **生成新的 Gemini API Key**
   - 访问：https://aistudio.google.com/apikey
   - 点击「Create API Key」
   - **重要：请将 API Key 保存在安全的地方，不要在公开渠道分享！**

### 方法 1：使用部署脚本（推荐）

#### Windows 用户：

```cmd
cd functions\generate-content
deploy.bat 你的_API_Key
```

#### Linux/Mac 用户：

```bash
cd functions/generate-content
chmod +x deploy.sh
./deploy.sh 你的_API_Key
```

### 方法 2：手动部署

```bash
cd functions/generate-content

# 部署到 Cloud Functions（第二代）
gcloud functions deploy generate-content \
  --gen2 \
  --runtime=nodejs20 \
  --region=europe-west1 \
  --source=. \
  --entry-point=generateContent \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=你的_API_Key \
  --memory=512MB \
  --timeout=60s \
  --max-instances=10 \
  --project=gen-lang-client-0260270819
```

## 📡 部署后验证

### 1. 获取函数 URL

部署成功后会显示 URL，格式如下：
```
https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content
```

### 2. 测试感谢信生成

```bash
curl -X POST https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "thanks-letter",
    "developerName": "测试开发者",
    "botCount": 10,
    "topCategory": "AI"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "result": "测试开发者，你在 2025 年点燃了 10 个创意火种..."
}
```

### 3. 测试头像生成

```bash
curl -X POST https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content \
  -H "Content-Type: application/json" \
  -d '{
    "type": "avatar",
    "developerName": "测试开发者",
    "botCount": 10,
    "topCategory": "AI"
  }'
```

**预期响应：**
```json
{
  "success": true,
  "result": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

### 4. 查看函数日志

```bash
# 实时查看日志
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --project=gen-lang-client-0260270819 \
  --limit=50

# 查看错误日志
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --project=gen-lang-client-0260270819 \
  --filter="severity>=ERROR"
```

## 🔧 前端集成

### 修改前端代码

前端代码（`services/geminiService.ts`）已经更新为调用 Cloud Function。

**默认 URL：**
```typescript
const CLOUD_FUNCTION_URL =
  'https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content';
```

如果函数 URL 不同，可以通过环境变量覆盖：

```bash
# .env.local
CLOUD_FUNCTION_URL=https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/generate-content
```

### 重新部署前端

```bash
# 返回项目根目录
cd ../..

# 提交代码
git add .
git commit -m "集成 Cloud Function 后端代理"
git push origin main

# Cloud Build 会自动重新构建和部署
```

## 🛠️ 故障排查

### 问题 1：部署失败

**错误示例：**
```
ERROR: (gcloud.functions.deploy) ResponseError: status=[400]
```

**解决方法：**
1. 检查 gcloud CLI 是否最新：`gcloud components update`
2. 确认项目 ID 正确：`gcloud config get-value project`
3. 检查是否启用了 Cloud Functions API：
   ```bash
   gcloud services enable cloudfunctions.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

### 问题 2：函数返回 403 错误

**错误示例：**
```json
{
  "success": false,
  "error": "Your API key was reported as leaked"
}
```

**解决方法：**
1. 生成新的 API Key
2. 重新部署函数并传入新的 API Key
3. **不要在公开渠道分享 API Key！**

### 问题 3：前端调用超时

**错误示例：**
```
❌ 调用 Cloud Function 失败: TypeError: Failed to fetch
```

**解决方法：**
1. 检查 CORS 配置（函数已默认配置）
2. 验证函数 URL 是否正确
3. 检查函数是否成功部署：
   ```bash
   gcloud functions describe generate-content \
     --region=europe-west1 \
     --project=gen-lang-client-0260270819
   ```

### 问题 4：Gemini API 调用失败

**错误示例：**
```json
{
  "success": false,
  "error": "Failed to fetch"
}
```

**解决方法：**
1. 检查 API Key 是否有效
2. 查看函数日志确认详细错误：
   ```bash
   gcloud functions logs read generate-content --region=europe-west1
   ```
3. 确认 Gemini API 配额未超限

## 💰 成本估算

### Cloud Functions 定价（europe-west1）

| 资源 | 配置 | 单价 | 每月免费额度 |
|------|------|------|-------------|
| 调用次数 | - | $0.40/百万次 | 200 万次 |
| 计算时间 | 512MB 内存 | $0.000001666/GHz-秒 | 40 万 GHz-秒 |
| 网络出站 | - | $0.12/GB | 5GB |

**典型使用场景：**
- 假设每天 1000 个用户查询
- 每个用户生成感谢信 + 头像（2 次调用）
- 每月调用次数：1000 × 2 × 30 = 60,000 次
- **预计月成本：< $1 USD** ✅（在免费额度内）

### Gemini API 定价

| 模型 | 输入 | 输出 | 免费额度 |
|------|------|------|---------|
| gemini-3-flash-preview | $0.075/百万 tokens | $0.30/百万 tokens | 1500 次/天 |
| gemini-3-pro-image-preview | $2.50/张 | - | 50 次/天 |

**说明：**
- 感谢信生成（文本）：每次约 200 tokens，成本极低
- 头像生成（图片）：每次 $2.50，可考虑缓存优化

## 📊 监控和维护

### 查看函数指标

1. **Cloud Console 控制台**
   - 访问：https://console.cloud.google.com/functions
   - 选择项目：gen-lang-client-0260270819
   - 点击函数名称查看详细指标

2. **关键指标**
   - 调用次数
   - 错误率
   - 平均执行时间
   - 内存使用量

### 更新 API Key

```bash
# 方法 1：使用 gcloud CLI
gcloud functions deploy generate-content \
  --region=europe-west1 \
  --update-env-vars GEMINI_API_KEY=新的_API_Key

# 方法 2：在 Cloud Console UI 中更新
# 1. 访问函数详情页
# 2. 点击「编辑」
# 3. 展开「运行时、构建、连接和安全设置」
# 4. 修改「环境变量」
# 5. 点击「部署」
```

### 删除函数

```bash
gcloud functions delete generate-content \
  --region=europe-west1 \
  --project=gen-lang-client-0260270819
```

## 🔗 相关文档

- [Cloud Functions 官方文档](https://cloud.google.com/functions/docs)
- [Gemini API 文档](https://ai.google.dev/docs)
- [项目主 README](../../README.md)
- [API 代理完整方案](../../API_PROXY_SOLUTION.md)
- [验证清单](../../VERIFICATION.md)

## 💡 最佳实践

1. **API Key 管理**
   - ✅ 使用 Secret Manager 存储敏感信息
   - ✅ 定期轮换 API Key
   - ❌ 永远不要在代码或日志中硬编码 API Key

2. **安全配置**
   - ✅ 使用 `--allow-unauthenticated` 仅限公开 API
   - ✅ 考虑添加 rate limiting
   - ✅ 监控异常调用模式

3. **性能优化**
   - ✅ 使用缓存减少重复生成
   - ✅ 设置合理的超时时间
   - ✅ 控制最大并发实例数

4. **成本控制**
   - ✅ 设置预算提醒
   - ✅ 监控 API 调用次数
   - ✅ 考虑缓存高频请求

---

**部署时间：** 2025-12-26
**维护者：** MyShell Team
**技术支持：** Claude Code + Google Cloud
