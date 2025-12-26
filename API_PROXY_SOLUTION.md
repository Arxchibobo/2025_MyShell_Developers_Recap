# API 代理解决方案 - 彻底解决 API Key 泄露问题

## 问题根源

**当前架构问题**：
```
浏览器 → 直接调用 Gemini API（API Key 暴露在前端代码中）
```

即使将 API Key 编译到 JavaScript 中，任何人都可以：
1. 打开浏览器开发者工具
2. 查看网络请求
3. 提取 API Key
4. 导致 Google 检测到泄露并禁用 Key

## 解决方案：后端 API 代理

**新架构**：
```
浏览器 → 你的后端 API → Gemini API（API Key 安全存储在服务端）
```

### 优势：
- ✅ API Key 永远不会暴露给用户
- ✅ 可以添加速率限制、日志记录
- ✅ 可以缓存结果，减少 API 调用
- ✅ 可以在服务端添加额外的安全验证

---

## 方案 A：使用 Cloud Functions（最简单）

### 1. 创建 Cloud Function

创建文件 `functions/generate-content/index.js`：

```javascript
const { GoogleGenAI } = require("@google/genai");

// 从环境变量读取 API Key（不会暴露给前端）
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

exports.generateContent = async (req, res) => {
  // CORS 设置
  res.set('Access-Control-Allow-Origin', 'https://myshell2025recap-153665040479.europe-west1.run.app');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  try {
    const { type, developerName, botCount, topCategory } = req.body;

    // 根据类型生成不同的提示词
    let prompt;
    if (type === 'thanks-letter') {
      prompt = `你是一位 MyShell 社区首席官。正在为 2025 年度总结撰写致辞。
目标对象：开发者 "${developerName}"。
成就：贡献了 ${botCount} 个 Bot。
核心领域：${topCategory}。
请写一段简短有力的中文感谢信（50-80字）。
要求包含：名字 "${developerName}"、数字 "${botCount}"、关键词"创意火种"、"智能版图"。
语气：激动人心且富有敬意。`;
    } else if (type === 'avatar') {
      prompt = `A cinematic 3D masterpiece celebrating the developer "${developerName}".
The center of the image is a massive, elegant golden trophy.
Extremely important: The text "${developerName}" MUST be written in huge, clean, bold 3D typography on the body of the trophy.
A cute high-tech MyShell mascot robot (indigo blue and white) is hugging the trophy excitedly.
Background: A high-tech stadium with holographic screens displaying "${topCategory}" and floating code particles.
Lighting: Epic purple and blue spotlights, golden sparkles, confetti.
Style: 4K Octane render, Pixar movie quality, hyper-realistic textures.
The name "${developerName}" is the hero of this visual.`;
    }

    // 调用 Gemini API
    const model = type === 'avatar' ? 'gemini-3-pro-image-preview' : 'gemini-3-flash-preview';
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: type === 'avatar' ? {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "2K"
        }
      } : undefined
    });

    // 返回结果
    if (type === 'avatar') {
      // 提取图片 base64
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          res.json({
            success: true,
            imageData: `data:image/png;base64,${part.inlineData.data}`
          });
          return;
        }
      }
      res.json({ success: false, error: '未找到图片数据' });
    } else {
      res.json({
        success: true,
        text: response.text
      });
    }

  } catch (error) {
    console.error('API 调用失败:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
```

### 2. 部署 Cloud Function

```bash
gcloud functions deploy generate-content \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=你的API_Key \
  --region europe-west1
```

### 3. 修改前端代码

修改 `services/geminiService.ts`：

```typescript
const CLOUD_FUNCTION_URL = 'https://europe-west1-gen-lang-client-0260270819.cloudfunctions.net/generate-content';

export const generateArchetypeSummary = async (
  name: string,
  botCount: number,
  topTag: string
) => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'thanks-letter',
        developerName: name,
        botCount,
        topCategory: topTag
      })
    });

    const data = await response.json();
    if (data.success) {
      return data.text;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    console.error('生成感谢信失败:', error);
    // 返回备用文案
    return `${name}，你在 2025 年点燃了 ${botCount} 个创意火种...`;
  }
};

export const generateFutureVisionFallback = async (
  developerName: string,
  topCategory: string
) => {
  try {
    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'avatar',
        developerName,
        botCount: 0,
        topCategory
      })
    });

    const data = await response.json();
    if (data.success) {
      return data.imageData;
    }
    return null;
  } catch (error) {
    console.error('生成头像失败:', error);
    return null;
  }
};
```

---

## 方案 B：使用 Cloud Run（更灵活）

### 1. 创建简单的 Express 服务器

创建 `api/server.js`：

```javascript
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 8080;

// 允许你的前端域名
app.use(cors({
  origin: 'https://myshell2025recap-153665040479.europe-west1.run.app'
}));

app.use(express.json());

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate', async (req, res) => {
  try {
    const { type, developerName, botCount, topCategory } = req.body;

    // ... 与 Cloud Function 相同的逻辑 ...

    res.json({ success: true, result: response.text });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(port, () => {
  console.log(`API 服务运行在端口 ${port}`);
});
```

### 2. 创建 Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
```

### 3. 部署到 Cloud Run

```bash
gcloud run deploy gemini-api-proxy \
  --source . \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=你的API_Key
```

---

## 方案 C：临时快速修复（不推荐，但能立即工作）

如果你急需上线，可以临时：

1. **创建受限的 API Key**（如前所述）
2. **添加域名白名单**
3. **接受一定的安全风险**

但这只是临时方案，长期仍需使用方案 A 或 B。

---

## 成本对比

| 方案 | 成本 | 安全性 | 复杂度 |
|------|------|--------|--------|
| 当前方案（前端） | 免费 | ❌ 极低 | 简单 |
| Cloud Functions | ~$0.40/百万次请求 | ✅ 高 | 中等 |
| Cloud Run | ~$0.10/百万次请求 | ✅ 高 | 中等 |
| 受限 API Key | 免费 | ⚠️ 中等 | 简单 |

---

## 推荐方案

**我建议使用 Cloud Functions（方案 A）**，因为：
1. ✅ 最简单的后端方案
2. ✅ 按需付费，成本很低
3. ✅ 自动扩容
4. ✅ API Key 完全不会暴露
5. ✅ 5 分钟即可部署完成

---

## 下一步

请告诉我你希望使用哪个方案，我会立即帮你实现！
