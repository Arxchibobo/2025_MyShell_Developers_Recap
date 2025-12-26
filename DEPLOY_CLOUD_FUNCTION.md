# 🚀 Cloud Function 部署完整指南

**更新时间：** 2025-12-26
**预计完成时间：** 5-10 分钟
**难度：** ⭐⭐☆☆☆（简单）

---

## 📋 部署流程概览

```
生成 API Key → 安装 gcloud CLI → 部署函数 → 验证测试 → 完成 ✅
    (2分钟)        (1分钟)          (2分钟)      (1分钟)
```

---

## ✅ 前提条件检查

在开始之前，请确认：

- [ ] 有 Google Cloud 账号
- [ ] 有项目权限（gen-lang-client-0260270819）
- [ ] 有稳定的网络连接
- [ ] Windows/Mac/Linux 任一操作系统

---

## 第 1 步：生成新的 Gemini API Key（2 分钟）

### 1.1 访问 Google AI Studio

打开浏览器，访问：https://aistudio.google.com/apikey

### 1.2 创建 API Key

1. 点击蓝色按钮「**Create API Key**」
2. 选择项目：`gen-lang-client-0260270819`
3. 点击「**Create API key in existing project**」

### 1.3 保存 API Key

您会看到类似这样的 API Key：
```
AIzaSyC...（39 个字符）
```

**⚠️ 重要安全提示：**
- ✅ 复制并保存到安全的地方（密码管理器）
- ❌ 不要在公开渠道分享（GitHub、聊天记录等）
- ❌ 不要提交到代码仓库
- ❌ 不要截图包含完整 API Key

---

## 第 2 步：安装 Google Cloud SDK（1 分钟）

### 检查是否已安装

打开终端/命令提示符，运行：

```bash
gcloud --version
```

如果看到版本号（如 `Google Cloud SDK 450.0.0`），说明已安装，可以跳到第 3 步。

### Windows 用户

1. 下载安装程序：
   - 直接下载：https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
   - 或访问：https://cloud.google.com/sdk/docs/install

2. 运行安装程序，全部选择默认选项

3. 安装完成后，**重新打开命令提示符**

### Mac 用户

使用 Homebrew 安装：

```bash
brew install --cask google-cloud-sdk
```

或者手动下载：https://cloud.google.com/sdk/docs/install

### Linux 用户

```bash
# 下载并安装
curl https://sdk.cloud.google.com | bash

# 重新加载 shell
exec -l $SHELL

# 初始化
gcloud init
```

---

## 第 3 步：登录并配置 Google Cloud（1 分钟）

### 3.1 登录 Google Cloud

```bash
gcloud auth login
```

这会打开浏览器窗口，请使用您的 Google 账号登录。

### 3.2 设置项目 ID

```bash
gcloud config set project gen-lang-client-0260270819
```

### 3.3 验证配置

```bash
gcloud config get-value project
```

应该显示：`gen-lang-client-0260270819` ✅

---

## 第 4 步：部署 Cloud Function（2 分钟）

### 4.1 进入函数目录

**Windows 用户：**
```cmd
cd functions\generate-content
```

**Mac/Linux 用户：**
```bash
cd functions/generate-content
```

### 4.2 执行部署脚本

**Windows 用户：**
```cmd
deploy.bat 你的_API_Key
```

**Mac/Linux 用户：**
```bash
chmod +x deploy.sh
./deploy.sh 你的_API_Key
```

**注意：** 将 `你的_API_Key` 替换为第 1 步生成的实际 API Key（39 个字符）

### 4.3 确认部署

脚本会提示：
```
确认部署？(y/n)
```

输入 `y` 并回车。

### 4.4 等待部署完成

部署过程大约需要 1-2 分钟，您会看到类似的输出：

```
Deploying function (may take a while - up to 2 minutes)...
...................................................done.
availableMemoryMb: 512
buildId: ...
entryPoint: generateContent
httpsTrigger:
  url: https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content
...
```

**记下这个 URL！** 这是您的 Cloud Function 地址。

---

## 第 5 步：验证部署（1 分钟）

### 5.1 测试感谢信生成

**Windows 用户（使用 PowerShell）：**
```powershell
$body = @{
    type = "thanks-letter"
    developerName = "测试开发者"
    botCount = 10
    topCategory = "AI"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

**Mac/Linux 用户（使用 curl）：**
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

### 5.2 检查响应

**成功响应示例：**
```json
{
  "success": true,
  "result": "测试开发者，你在 2025 年点燃了 10 个创意火种，在 AI 领域绘制了属于自己的智能版图。感谢你为 MyShell 社区带来的每一份创新与热情！"
}
```

如果看到类似的响应，说明部署成功！✅

### 5.3 测试头像生成（可选）

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

响应会包含 Base64 编码的图片数据：
```json
{
  "success": true,
  "result": "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
```

---

## 第 6 步：触发前端重新构建（1 分钟）

前端代码已经更新为调用 Cloud Function，现在需要重新构建：

### 6.1 返回项目根目录

```bash
cd ../..
```

### 6.2 查看当前状态

```bash
git status
```

### 6.3 触发构建

代码已经推送到 GitHub，Cloud Build 会自动检测并开始构建。

查看构建状态：
1. 访问：https://console.cloud.google.com/cloud-build/builds
2. 查看最新的构建任务
3. 等待 3-5 分钟直到构建完成

### 6.4 验证部署

访问生产环境：
```
https://myshell2025recap-153665040479.europe-west1.run.app
```

尝试搜索任意开发者名字，查看个性化感谢信和头像是否正常生成。

---

## ✅ 部署完成检查清单

完成后，请确认以下所有项都是 ✅：

- [ ] Cloud Function 已成功部署
- [ ] 函数 URL 可以访问
- [ ] 测试调用返回正确响应
- [ ] 前端网站可以访问
- [ ] 感谢信生成正常
- [ ] 头像生成正常（或显示适当的错误提示）
- [ ] API Key 未在公开渠道泄露

---

## 🛠️ 常见问题

### Q1: 部署时提示权限不足

**错误示例：**
```
ERROR: (gcloud.functions.deploy) PERMISSION_DENIED
```

**解决方法：**
1. 确认您的 Google 账号有项目权限
2. 联系项目管理员添加 `Cloud Functions Developer` 角色

### Q2: 部署成功但调用返回 500 错误

**错误示例：**
```json
{
  "success": false,
  "error": "Failed to fetch"
}
```

**解决方法：**
查看函数日志：
```bash
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --limit=50
```

常见原因：
- API Key 无效或已泄露
- 网络连接问题
- Gemini API 配额超限

### Q3: 前端仍然显示"API 配置失败"

**可能原因：**
- Cloud Build 尚未完成（需要 3-5 分钟）
- 浏览器缓存

**解决方法：**
1. 等待 Cloud Build 完成
2. 清除浏览器缓存并刷新页面
3. 使用隐私模式/无痕模式访问

### Q4: API Key 被标记为泄露

**错误示例：**
```
403: Your API key was reported as leaked
```

**解决方法：**
1. 生成新的 API Key（第 1 步）
2. 重新部署 Cloud Function：
   ```bash
   cd functions/generate-content
   ./deploy.sh 新的_API_Key
   ```
3. **不要在公开渠道分享 API Key！**

### Q5: 如何查看详细日志？

```bash
# 查看最近 50 条日志
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --limit=50

# 只查看错误日志
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --filter="severity>=ERROR"

# 实时查看日志
gcloud functions logs read generate-content \
  --region=europe-west1 \
  --follow
```

---

## 📊 成本估算

### 预计月成本

基于以下假设：
- 每天 1000 个用户
- 每个用户查询 1 次（生成感谢信 + 头像）
- 每月 30,000 次调用

**Cloud Functions 成本：** < $1 USD（在免费额度内）
**Gemini API 成本：**
- 文本生成：< $0.50 USD
- 图片生成：约 $75 USD（30,000 次 × $2.50/次）

**总计：** 约 $75-80 USD/月

### 成本优化建议

1. **缓存图片**：相同开发者名字返回缓存图片
2. **按需生成**：用户点击「生成头像」按钮时才生成
3. **使用更便宜的模型**：考虑使用其他图片生成服务

---

## 🔗 相关文档

- **5 分钟快速入门：** [functions/QUICKSTART.md](./functions/QUICKSTART.md)
- **完整技术文档：** [functions/README.md](./functions/README.md)
- **API 代理方案详解：** [API_PROXY_SOLUTION.md](./API_PROXY_SOLUTION.md)
- **项目状态报告：** [STATUS_REPORT.md](./STATUS_REPORT.md)
- **故障排查：** [DEBUG.md](./DEBUG.md)

---

## 📞 获取帮助

如果遇到问题：

1. 查看 [故障排查文档](./DEBUG.md)
2. 查看 [函数日志](#q5-如何查看详细日志)
3. 访问 [GitHub Issues](https://github.com/Arxchibobo/2025_MyShell_Developers_Recap/issues)

---

## 🎉 恭喜！

您已经成功部署了 Cloud Function 后端代理！现在：

- ✅ API Key 安全存储在服务端
- ✅ 前端代码中不包含任何敏感信息
- ✅ 即使 API Key 泄露也无需重新构建前端
- ✅ 可以随时更新 API Key

享受安全、稳定的 AI 功能吧！🚀

---

**部署时间：** 2025-12-26
**维护者：** MyShell Team
**技术支持：** Claude Code + Google Cloud
