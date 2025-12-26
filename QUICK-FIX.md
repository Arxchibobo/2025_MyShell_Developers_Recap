# 快速修复 API Key 配置

## 问题
日志显示 `🔑 API Key 状态: 未配置`，说明构建时没有注入 API Key。

## 解决方案（5 分钟）

### 方法 1：在 Cloud Console 手动配置（推荐）

#### 第 1 步：打开触发器页面
1. 访问：https://console.cloud.google.com/cloud-build/triggers?project=gen-lang-client-0260270819
2. 你会看到触发器列表

#### 第 2 步：编辑触发器
1. 找到 GitHub 仓库 `Arxchibobo/2025_MyShell_Developers_Recap` 的触发器
2. 点击右侧的 **三个点菜单** → **编辑**

#### 第 3 步：添加替换变量
1. 滚动到页面底部
2. 展开 **"高级"** (Show advanced) 部分
3. 找到 **"替换变量"** (Substitution variables)
4. 点击 **"添加变量"** (Add variable)
5. 输入：
   ```
   名称：_GEMINI_API_KEY
   值：AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc
   ```
6. 点击 **"保存"** (Save)

#### 第 4 步：触发新构建
有两种方式：

**方式 A：手动触发**
1. 在触发器列表页面，点击 **"运行"** (Run) 按钮
2. 选择分支：`main`
3. 点击 **"运行触发器"**

**方式 B：推送新 commit**
```bash
git commit --allow-empty -m "chore: trigger rebuild with API key"
git push
```

#### 第 5 步：等待构建完成
1. 访问：https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0260270819
2. 等待构建状态变为 **SUCCESS**（约 5-10 分钟）
3. 查看构建日志，确认没有错误

#### 第 6 步：验证修复
1. 访问你的 Cloud Run 服务 URL
2. 搜索任意开发者（如"木头"）
3. 按 F12 打开控制台
4. 应该看到：
   ```
   🔑 API Key 状态: 已配置 ✅
   ✅ Nana Banana Pro 调用成功
   ✅ 感谢信生成成功
   ```

---

### 方法 2：使用 gcloud 命令（需要先登录）

如果你熟悉命令行，可以使用以下命令：

```bash
# 1. 登录 Google Cloud
gcloud auth login

# 2. 设置项目
gcloud config set project gen-lang-client-0260270819

# 3. 列出触发器
gcloud builds triggers list

# 4. 更新触发器（替换 TRIGGER_ID）
gcloud builds triggers update TRIGGER_ID \
  --substitutions=_GEMINI_API_KEY=AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc

# 5. 手动触发构建
gcloud builds triggers run TRIGGER_NAME --branch=main
```

---

### 方法 3：直接在本地构建并测试（最快验证）

如果你想快速验证修复是否有效，可以先在本地测试：

```bash
# 1. 确保 .env.local 存在
cat .env.local
# 应该看到：GEMINI_API_KEY=AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc

# 2. 本地构建
npm run build

# 3. 本地预览
npm run preview
```

然后访问 http://localhost:4173 测试功能。

---

## 常见问题

### Q: 配置后仍然显示"未配置"
**A:** 确保：
1. 变量名是 `_GEMINI_API_KEY`（下划线开头）
2. 保存触发器后，手动触发了新的构建
3. 等待新构建完成后再测试

### Q: 构建失败
**A:** 查看构建日志：
- 访问 https://console.cloud.google.com/cloud-build/builds
- 点击失败的构建查看详细日志
- 常见问题：Docker 构建超时、API 配额不足

### Q: API Key 会暴露给用户吗？
**A:** 是的，当前方案会将 API Key 编译到前端代码中。建议：
- 使用有配额限制的 API Key
- 定期轮换 Key
- 后续迁移到后端代理方案

---

## 检查清单

- [ ] 在 Cloud Build 触发器中添加 `_GEMINI_API_KEY` 变量
- [ ] 保存触发器配置
- [ ] 触发新构建（手动或推送 commit）
- [ ] 等待构建完成（SUCCESS 状态）
- [ ] 访问网站并打开控制台测试
- [ ] 确认日志显示 "已配置" 和 API 调用成功

---

## 需要帮助？

如果以上步骤无法解决问题，请提供：
1. Cloud Build 构建日志截图
2. 浏览器控制台完整日志
3. 触发器配置截图

我会帮你进一步排查。
