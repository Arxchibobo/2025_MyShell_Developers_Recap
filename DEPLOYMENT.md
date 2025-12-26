# 部署配置说明

## 环境变量配置

本项目需要 Gemini API Key 才能正常运行 AI 生成功能（感谢信和开发者头像）。

### 本地开发

1. 复制 `.env.local.example` 为 `.env.local`：
   ```bash
   cp .env.local.example .env.local
   ```

2. 编辑 `.env.local`，填入你的 API Key：
   ```
   GEMINI_API_KEY=你的_Gemini_API_Key
   ```

3. 运行开发服务器：
   ```bash
   npm run dev
   ```

### Cloud Build 部署配置

由于前端代码在构建时需要将 API Key 注入到代码中，你需要在 Cloud Build 触发器中配置环境变量。

#### 配置步骤：

1. **打开 Google Cloud Console**
   - 访问：https://console.cloud.google.com/cloud-build/triggers
   - 选择你的项目

2. **编辑触发器**
   - 找到 `2025_MyShell_Developers_Recap` 的触发器
   - 点击"编辑"

3. **配置替换变量**
   - 滚动到页面底部，展开 **"高级"** 部分
   - 找到 **"替换变量"** 部分
   - 点击 **"添加变量"**

4. **添加 API Key 变量**
   ```
   变量名：_GEMINI_API_KEY
   值：AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc
   ```

   ⚠️ **安全提示**：替换变量的值会以明文形式存储在 Cloud Build 配置中。对于生产环境，建议使用 Secret Manager。

5. **保存触发器**
   - 点击页面底部的 **"保存"** 按钮

6. **触发构建**
   - 推送代码到 main 分支会自动触发构建
   - 或手动点击 "运行触发器" 立即构建

#### 验证配置

构建完成后，访问你的 Cloud Run 服务 URL：
- 搜索任意开发者名字
- 打开浏览器控制台（F12）
- 查看日志输出：
  - 如果看到 `🔑 API Key 状态: 已配置` → 配置成功 ✅
  - 如果看到 `🔑 API Key 状态: 未配置` → 需要重新检查配置 ❌

## 使用 Secret Manager（推荐用于生产环境）

为了更安全地管理 API Key，建议使用 Google Cloud Secret Manager：

1. **创建 Secret**：
   ```bash
   echo -n "AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc" | \
   gcloud secrets create gemini-api-key \
     --replication-policy="automatic" \
     --data-file=-
   ```

2. **授权 Cloud Build 访问 Secret**：
   ```bash
   PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

   gcloud secrets add-iam-policy-binding gemini-api-key \
     --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
     --role="roles/secretmanager.secretAccessor"
   ```

3. **修改 cloudbuild.yaml**：
   ```yaml
   availableSecrets:
     secretManager:
       - versionName: projects/$PROJECT_ID/secrets/gemini-api-key/versions/latest
         env: 'GEMINI_API_KEY'

   steps:
     - name: 'gcr.io/cloud-builders/docker'
       args: [
         'build',
         '--build-arg', 'GEMINI_API_KEY=$$GEMINI_API_KEY',
         '-t', 'gcr.io/$PROJECT_ID/myshell-recap:$COMMIT_SHA',
         '.'
       ]
       secretEnv: ['GEMINI_API_KEY']
   ```

## 故障排查

### 问题：控制台显示 "未配置 API Key"

**可能原因**：
1. Cloud Build 触发器中未配置 `_GEMINI_API_KEY` 变量
2. 变量名拼写错误（必须是 `_GEMINI_API_KEY`，下划线开头）
3. 配置后未重新触发构建

**解决方法**：
1. 检查触发器配置中的替换变量
2. 确保变量名完全匹配
3. 推送新 commit 或手动触发构建

### 问题：API 调用失败

**可能原因**：
1. API Key 无效或过期
2. API Key 没有启用 Gemini API
3. 超出配额限制

**解决方法**：
1. 访问 https://aistudio.google.com/app/apikey 验证 API Key
2. 确保启用了 Generative Language API
3. 检查 API 配额和计费设置

## 相关文档

- [Google Cloud Build 文档](https://cloud.google.com/build/docs)
- [Cloud Run 文档](https://cloud.google.com/run/docs)
- [Secret Manager 文档](https://cloud.google.com/secret-manager/docs)
- [Gemini API 文档](https://ai.google.dev/docs)
