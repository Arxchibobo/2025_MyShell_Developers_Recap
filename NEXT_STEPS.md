# 下一步行动计划

**当前项目状态：**
- ✅ 核心功能 100% 完成（数据展示、查询、抽奖）
- ❌ AI 功能阻塞（API Key 安全问题）
- ⏳ 等待决策：选择安全解决方案

---

## 🚨 紧急待办（阻塞 AI 功能）

### 问题：API Key 泄露导致 AI 功能无法使用

**现象：**
```
🔑 API Key 状态: 已配置
❌ 403: Your API key was reported as leaked. Please use another API key.
```

**原因：**
- 所有在此对话中提供的 API Key 已被 Google 检测为泄露
- 前端代码将 API Key 编译到 JavaScript，任何人都可以提取

**解决方案三选一：**

---

### 方案 A：Cloud Functions 后端代理 ⭐ **推荐**

**优点：**
- ✅ API Key 完全不暴露给前端
- ✅ 最简单的后端方案
- ✅ 自动扩容，按需付费
- ✅ 5 分钟即可部署

**成本：** ~$0.40/百万次请求

**实施步骤：**

1. **创建 Cloud Function**：
```bash
# 创建函数目录
mkdir -p functions/generate-content
cd functions/generate-content

# 创建 package.json
cat > package.json << 'EOF'
{
  "name": "generate-content",
  "version": "1.0.0",
  "dependencies": {
    "@google/genai": "^0.1.0"
  }
}
EOF

# 创建 index.js（代码见 API_PROXY_SOLUTION.md 第 35-120 行）
```

2. **部署函数**：
```bash
gcloud functions deploy generate-content \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=你的新API_Key \
  --region europe-west1
```

3. **修改前端代码**（`services/geminiService.ts`）：
```typescript
const CLOUD_FUNCTION_URL = 'https://europe-west1-PROJECT_ID.cloudfunctions.net/generate-content';

// 替换原有 API 调用为 fetch(CLOUD_FUNCTION_URL, ...)
```

4. **重新部署前端**：
```bash
git add .
git commit -m "使用 Cloud Functions 代理保护 API Key"
git push origin main
```

**详细代码：** 见 [API_PROXY_SOLUTION.md](./API_PROXY_SOLUTION.md) 第 31-201 行

---

### 方案 B：Cloud Run 后端代理

**优点：**
- ✅ API Key 完全不暴露
- ✅ 更灵活的后端逻辑
- ✅ 支持更复杂的功能

**成本：** ~$0.10/百万次请求

**实施步骤：**

1. 创建 Express 服务器（见 API_PROXY_SOLUTION.md 第 208-242 行）
2. 创建 Dockerfile（第 246-254 行）
3. 部署到 Cloud Run（第 258-265 行）
4. 修改前端调用

**详细代码：** 见 [API_PROXY_SOLUTION.md](./API_PROXY_SOLUTION.md) 第 204-266 行

---

### 方案 C：受限 API Key（临时方案）⚠️

**优点：**
- ✅ 无需修改架构
- ✅ 快速实施

**缺点：**
- ❌ API Key 仍然暴露在前端
- ❌ 只能延缓泄露，不能根治
- ❌ 不适合长期使用

**实施步骤：**

1. 前往 [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. 创建新 API Key
3. 添加限制：
   - **应用限制**：HTTP 引用站点
   - **网站限制**：`myshell2025recap-153665040479.europe-west1.run.app`
4. 配置到 Cloud Build 触发器
5. 触发重新构建

**注意：** 这只是临时方案，强烈建议使用方案 A 或 B。

---

## 🎯 推荐决策流程

```
┌─────────────────────────────────────────┐
│ 需要长期安全保障？                        │
└─────────┬───────────────────────────────┘
          │
    是 ───┼─── 否（仅临时上线）
          │                │
          ↓                ↓
  ┌───────────────┐  ┌──────────────┐
  │ 方案 A/B      │  │ 方案 C       │
  │ 后端代理      │  │ 受限 API Key  │
  └───────┬───────┘  └──────────────┘
          │
    需要额外功能？
          │
    是 ───┼─── 否
          │       │
          ↓       ↓
   方案 B      方案 A
   Cloud Run   Cloud Functions
   (更灵活)    (更简单) ⭐
```

---

## 📋 行动检查清单

### 选择方案 A（Cloud Functions）

- [ ] 1. 生成新的 Gemini API Key（不要在此对话中发送！）
- [ ] 2. 创建 Cloud Function 目录和代码
- [ ] 3. 部署 Cloud Function（携带新 API Key）
- [ ] 4. 获取 Function URL
- [ ] 5. 修改前端代码（`services/geminiService.ts`）
- [ ] 6. 测试本地调用（`npm run dev`）
- [ ] 7. 提交并推送到 GitHub
- [ ] 8. 等待 Cloud Build 完成
- [ ] 9. 验证生产环境（见 VERIFICATION.md）

### 选择方案 B（Cloud Run）

- [ ] 1. 生成新的 Gemini API Key
- [ ] 2. 创建 Express 服务器代码
- [ ] 3. 创建 Dockerfile
- [ ] 4. 部署到 Cloud Run
- [ ] 5. 获取 Service URL
- [ ] 6. 修改前端代码
- [ ] 7. 测试和部署（同方案 A 第 6-9 步）

### 选择方案 C（临时方案）

- [ ] 1. 生成新的 Gemini API Key
- [ ] 2. 在 Cloud Console 添加 HTTP 引用站点限制
- [ ] 3. 配置到 Cloud Build 触发器（通过 UI，不要在对话中发送）
- [ ] 4. 触发重新构建
- [ ] 5. 验证生产环境

---

## 🔐 API Key 安全最佳实践

### ✅ 应该做的：

1. **通过安全渠道传递 API Key**：
   - ✅ 直接在 Cloud Console UI 配置
   - ✅ 使用 Secret Manager
   - ✅ 通过加密的私有通信

2. **使用后端代理**：
   - ✅ Cloud Functions
   - ✅ Cloud Run
   - ✅ 任何服务端 API

3. **添加使用限制**：
   - ✅ 配额限制
   - ✅ HTTP 引用站点限制
   - ✅ IP 地址限制（如可行）

### ❌ 不应该做的：

1. **在公开渠道暴露 API Key**：
   - ❌ 公开的 GitHub 仓库
   - ❌ 公开的对话记录
   - ❌ 前端代码中硬编码

2. **直接在前端调用 API**：
   - ❌ 编译到 JavaScript 中
   - ❌ 存储在 localStorage
   - ❌ 任何客户端可见的位置

---

## 📞 如何安全地提供新 API Key？

### 方法 1：直接在 Cloud Build UI 配置 ⭐ **推荐**

1. 访问 [Cloud Build 触发器](https://console.cloud.google.com/cloud-build/triggers?project=gen-lang-client-0260270819)
2. 编辑触发器
3. 展开 "高级" → "替换变量"
4. 更新 `_GEMINI_API_KEY` 的值
5. 保存

### 方法 2：使用 Secret Manager

```bash
# 1. 创建 Secret
echo -n "你的新API_Key" | gcloud secrets create gemini-api-key --data-file=-

# 2. 授权 Cloud Build 访问
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER@cloudbuild.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"

# 3. 修改 cloudbuild.yaml 使用 Secret
```

### 方法 3：通过环境变量文件（本地开发）

```bash
# 创建 .env.local（已在 .gitignore 中）
echo "GEMINI_API_KEY=你的新API_Key" > .env.local
```

---

## ⏱️ 预计实施时间

| 方案 | 准备时间 | 部署时间 | 总耗时 |
|------|----------|----------|--------|
| 方案 A（Cloud Functions） | 10 分钟 | 5 分钟 | **15 分钟** ⭐ |
| 方案 B（Cloud Run） | 20 分钟 | 5 分钟 | **25 分钟** |
| 方案 C（受限 API Key） | 5 分钟 | 5 分钟 | **10 分钟** ⚠️ |

---

## 🎬 准备就绪？

请告知你选择的方案：

- **方案 A**：我会立即帮你创建 Cloud Function 代码
- **方案 B**：我会立即帮你创建 Cloud Run 服务器代码
- **方案 C**：我会提供配置受限 API Key 的详细步骤

**重要提醒：** 新的 API Key 请直接在 Cloud Console 配置，不要在此对话中发送！

---

**相关文档：**
- [API_PROXY_SOLUTION.md](./API_PROXY_SOLUTION.md) - 完整的代码示例和部署步骤
- [VERIFICATION.md](./VERIFICATION.md) - 部署后验证清单
- [STATUS_REPORT.md](./STATUS_REPORT.md) - 项目整体状态报告
