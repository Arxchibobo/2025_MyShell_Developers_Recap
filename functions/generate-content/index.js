/**
 * MyShell 2025 年度回顾 - Gemini API 代理
 *
 * 功能：
 * 1. 保护 API Key 不暴露给前端
 * 2. 生成个性化感谢信（文本）
 * 3. 生成开发者头像（图片）
 *
 * 端点：/generate-content
 * 方法：POST
 *
 * 请求体：
 * {
 *   "type": "thanks-letter" | "avatar",
 *   "developerName": "开发者名称",
 *   "botCount": 10,
 *   "topCategory": "主要分类"
 * }
 */

const { GoogleGenAI } = require("@google/genai");

// 从环境变量读取 API Key（部署时配置，不会暴露给前端）
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ 错误：未配置 GEMINI_API_KEY 环境变量');
}

const ai = new GoogleGenAI({ apiKey });

/**
 * Cloud Function 入口函数
 */
exports.generateContent = async (req, res) => {
  // 设置 CORS 头（允许前端调用）
  res.set('Access-Control-Allow-Origin', '*'); // 生产环境建议改为具体域名
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // 处理预检请求
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: '只支持 POST 请求'
    });
    return;
  }

  try {
    const { type, developerName, botCount, topCategory } = req.body;

    // 参数验证
    if (!type || !developerName) {
      res.status(400).json({
        success: false,
        error: '缺少必需参数：type 或 developerName'
      });
      return;
    }

    console.log(`📝 收到请求：type=${type}, developer=${developerName}`);

    // 根据类型调用不同的生成函数
    let result;
    if (type === 'thanks-letter') {
      result = await generateThanksLetter(developerName, botCount, topCategory);
    } else if (type === 'avatar') {
      result = await generateAvatar(developerName, botCount, topCategory);
    } else {
      res.status(400).json({
        success: false,
        error: '无效的 type 参数，必须是 "thanks-letter" 或 "avatar"'
      });
      return;
    }

    // 返回成功结果
    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('❌ 生成失败:', error);
    res.status(500).json({
      success: false,
      error: error.message || '生成失败'
    });
  }
};

/**
 * 生成个性化感谢信
 */
async function generateThanksLetter(name, botCount, topTag) {
  try {
    console.log(`📝 生成感谢信: ${name}, ${botCount} 个 Bot, 类别: ${topTag}`);

    const prompt = `你是一位 MyShell 社区首席官。正在为 2025 年度总结撰写致辞。
目标对象：开发者 "${name}"。
成就：贡献了 ${botCount} 个 Bot。
核心领域：${topTag}。
请写一段简短有力的中文感谢信（50-80字）。
要求包含：名字 "${name}"、数字 "${botCount}"、关键词"创意火种"、"智能版图"。
语气：激动人心且富有敬意。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const text = response.text;
    console.log(`✅ 感谢信生成成功: ${text.substring(0, 50)}...`);
    return text;

  } catch (error) {
    console.error('❌ 感谢信生成失败:', error);
    // 返回备用文案
    return `${name}，你在 2025 年点燃了 ${botCount} 个创意火种，在 ${topTag} 领域绘制了属于自己的智能版图。感谢你为 MyShell 社区带来的每一份创新与热情！`;
  }
}

/**
 * 生成开发者头像
 */
async function generateAvatar(developerName, botCount, topCategory) {
  try {
    console.log(`🎨 生成头像: ${developerName}, ${botCount} 个 Bot, 类别: ${topCategory}`);

    const prompt = `A cinematic 3D masterpiece celebrating the developer "${developerName}".
The center of the image is a massive, elegant golden trophy.
Extremely important: The text "${developerName}" MUST be written in huge, clean, bold 3D typography on the body of the trophy.
A cute high-tech MyShell mascot robot (indigo blue and white) is hugging the trophy excitedly.
Background: A high-tech stadium with holographic screens displaying "${topCategory}" and floating code particles.
Lighting: Epic purple and blue spotlights, golden sparkles, confetti.
Style: 4K Octane render, Pixar movie quality, hyper-realistic textures.
The name "${developerName}" is the hero of this visual.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "2K"
        }
      }
    });

    // 提取 base64 图片数据
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64Image = `data:image/png;base64,${part.inlineData.data}`;
        console.log(`✅ 头像生成成功: ${base64Image.substring(0, 50)}...`);
        return base64Image;
      }
    }

    console.warn('⚠️ 响应中未找到图片数据');
    return null;

  } catch (error) {
    console.error('❌ 头像生成失败:', error);
    return null;
  }
}
