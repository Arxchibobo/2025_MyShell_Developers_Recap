# Cloud Function 5 分钟快速部署

## 第 1 步：准备 API Key（2 分钟）

1. 访问：https://aistudio.google.com/apikey
2. 点击「Create API Key」
3. 复制 API Key（格式：`AIzaSy...`）
4. **⚠️ 保存到安全的地方，不要分享！**

## 第 2 步：安装 gcloud CLI（如已安装跳过）

### Windows：
1. 下载：https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe
2. 运行安装程序
3. 打开新的命令提示符

### Mac：
```bash
brew install --cask google-cloud-sdk
```

### Linux：
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
```

## 第 3 步：登录和配置（1 分钟）

```bash
# 登录 Google Cloud
gcloud auth login

# 设置项目
gcloud config set project gen-lang-client-0260270819
```

## 第 4 步：部署函数（2 分钟）

### Windows：
```cmd
cd functions\generate-content
deploy.bat 你的_API_Key
```

### Mac/Linux：
```bash
cd functions/generate-content
chmod +x deploy.sh
./deploy.sh 你的_API_Key
```

## 第 5 步：验证（30 秒）

部署成功后会显示 URL，类似：
```
https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content
```

测试调用：
```bash
curl -X POST https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content \
  -H "Content-Type: application/json" \
  -d '{"type":"thanks-letter","developerName":"测试","botCount":10,"topCategory":"AI"}'
```

看到这样的响应就成功了：
```json
{
  "success": true,
  "result": "测试，你在 2025 年点燃了 10 个创意火种..."
}
```

## 🎉 完成！

前端代码已经配置好，会自动调用这个 Cloud Function。

现在提交并推送代码触发重新部署：

```bash
cd ../..
git add .
git commit -m "集成 Cloud Function 后端代理"
git push origin main
```

等待 3-5 分钟，Cloud Build 会自动部署新版本到：
https://myshell2025recap-153665040479.europe-west1.run.app

---

**遇到问题？** 查看 [完整部署指南](./README.md) 或 [故障排查文档](../DEBUG.md)
