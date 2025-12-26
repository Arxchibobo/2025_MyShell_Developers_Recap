# API Key 配置调试指南

## 当前状态
- ✅ Dockerfile 已配置接收 `ARG GEMINI_API_KEY`
- ✅ cloudbuild.yaml 已配置 `--build-arg GEMINI_API_KEY=${_GEMINI_API_KEY}`
- ✅ Cloud Build 触发器已配置 `_GEMINI_API_KEY` 变量
- ⏳ 等待新构建完成

## 验证步骤

### 1. 检查 Cloud Build 构建日志

访问：https://console.cloud.google.com/cloud-build/builds?project=gen-lang-client-0260270819

在构建日志中搜索以下关键词：

```bash
# 应该能看到
--build-arg GEMINI_API_KEY=AIza...
```

**如果看不到**：说明触发器的替换变量没有正确传递，需要检查触发器配置。

### 2. 检查构建时的环境变量

在构建日志中查找 `Step 1` 部分，应该有类似输出：

```
Step 1/10 : ARG GEMINI_API_KEY
Step 2/10 : ENV GEMINI_API_KEY=$GEMINI_API_KEY
```

### 3. 验证前端代码中的变量

构建完成后，访问网站，在控制台运行：

```javascript
console.log('API_KEY:', process.env.API_KEY);
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY);
console.log('MYSHELL_API_KEY:', process.env.MYSHELL_API_KEY);
```

**预期结果**：应该都显示 API Key 值，而不是 `undefined`。

### 4. 检查 Vite 配置

确认 `vite.config.ts` 的 define 块包含：

```typescript
define: {
  'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
  'process.env.MYSHELL_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
}
```

## 常见问题排查

### 问题 1：构建日志显示 `GEMINI_API_KEY=`（空值）

**原因**：触发器的替换变量配置有误或未保存

**解决方法**：
1. 重新打开触发器编辑页面
2. 确认 `_GEMINI_API_KEY` 存在且有值
3. 保存后等待几分钟，再次触发构建

### 问题 2：构建成功但前端仍显示"未配置"

**原因**：浏览器缓存了旧的 JavaScript 文件

**解决方法**：
1. 硬刷新：`Ctrl + Shift + R` (Windows) 或 `Cmd + Shift + R` (Mac)
2. 清空缓存并硬性重新加载
3. 使用无痕模式测试

### 问题 3：vite.config.ts 读取不到环境变量

**原因**：Docker 构建时环境变量作用域问题

**解决方法**：

修改 `vite.config.ts`，直接从 `process.env` 读取：

```typescript
export default defineConfig({
  // ...
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || ''),
    'process.env.MYSHELL_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY || '')
  }
})
```

### 问题 4：替换变量名称错误

**检查清单**：
- [ ] 变量名必须以下划线 `_` 开头
- [ ] 在 cloudbuild.yaml 中使用 `${_GEMINI_API_KEY}` 格式
- [ ] 在触发器中配置的变量名是 `_GEMINI_API_KEY`（不是 `GEMINI_API_KEY`）

## 临时解决方案（不推荐）

如果以上都无法解决，可以临时将 API Key 直接硬编码到 vite.config.ts：

```typescript
define: {
  'process.env.API_KEY': JSON.stringify('AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc'),
  'process.env.GEMINI_API_KEY': JSON.stringify('AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc'),
  'process.env.MYSHELL_API_KEY': JSON.stringify('AIzaSyCW7d93enbOLiKUnVQqbgaD41lL3oUzZFc')
}
```

⚠️ **警告**：这会将 API Key 暴露在 Git 仓库中，仅用于紧急测试！

## 正确的长期解决方案

创建后端 API 代理，将 API 调用移到服务端：

1. 创建 Cloud Function 或 Cloud Run 服务
2. 在服务端调用 Gemini/MyShell API
3. 前端只调用你的代理 API
4. API Key 存储在服务端环境变量中

这样前端永远不会暴露 API Key。

## 联系支持

如果问题仍未解决，请提供：
1. 最新的 Cloud Build 构建日志（完整）
2. 浏览器控制台截图
3. 触发器配置截图
