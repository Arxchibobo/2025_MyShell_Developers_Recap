
import { GoogleGenAI, Type } from "@google/genai";

export const getGeminiResponse = async (prompt: string, model: string = 'gemini-3-flash-preview') => {
  try {
    console.log('🤖 调用 Gemini API:', model);
    console.log('🔑 API Key 状态:', process.env.API_KEY ? '已配置' : '未配置');

    if (!process.env.API_KEY) {
      console.error('❌ Gemini API Key 未配置');
      throw new Error('Gemini API Key 未配置，请检查环境变量');
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    console.log('✅ Gemini API 调用成功');
    return response.text;
  } catch (error) {
    console.error('❌ Gemini API 调用失败:', error);
    throw error;
  }
};

export const generateArchetypeSummary = async (name: string, botCount: number, topTag: string) => {
  try {
    console.log('📝 生成感谢信:', { name, botCount, topTag });

    const prompt = `你是一位 MyShell 社区首席官。正在为 2025 年度总结撰写致辞。
  目标对象：开发者 "${name}"。
  成就：贡献了 ${botCount} 个 Bot。
  核心领域：${topTag}。
  请写一段简短有力的中文感谢信（50-80字）。
  要求包含：名字 "${name}"、数字 "${botCount}"、关键词"创意火种"、"智能版图"。
  语气：激动人心且富有敬意。`;

    const result = await getGeminiResponse(prompt, 'gemini-3-flash-preview');
    console.log('✅ 感谢信生成成功');
    return result;
  } catch (error) {
    console.error('❌ 感谢信生成失败，返回备用文案:', error);
    // 返回备用感谢信
    return `${name}，你在 2025 年点燃了 ${botCount} 个创意火种，在 ${topTag} 领域绘制了属于自己的智能版图。感谢你为 MyShell 社区带来的每一份创新与热情！`;
  }
};

/**
 * 使用 Nana Banana Pro 生成开发者个性化头像
 * @param developerName 开发者名称
 * @param botCount Bot 数量
 * @param topCategory 主要创作类别
 */
export const generateDeveloperAvatar = async (
  developerName: string,
  botCount: number,
  topCategory: string
): Promise<string | null> => {
  try {
    console.log('🎨 生成开发者头像:', { developerName, botCount, topCategory });
    console.log('🔑 MYSHELL_API_KEY 状态:', process.env.MYSHELL_API_KEY ? '已配置' : '未配置');
    console.log('🔑 API_KEY 备用状态:', process.env.API_KEY ? '已配置' : '未配置');

    // Nana Banana Pro 提示词：庆祝开发者成就的个性化头像
    const prompt = `A stunning avatar celebrating developer achievement.
    Portrait of a creative AI developer, tech-style illustration.
    Central focus: A confident developer surrounded by holographic ${topCategory} icons and ${botCount} floating bot symbols.
    Text overlay: "${developerName}" in elegant futuristic typography.
    Color scheme: Deep indigo blue (#6366f1), purple gradient, white accents.
    Style: Modern tech illustration, Pixar-like 3D character design, professional and inspiring.
    Lighting: Soft purple glow, blue rim light, warm highlights.
    Mood: Celebratory, innovative, achievement-focused.
    Background: Abstract tech particles, code snippets, MyShell branding elements.
    Quality: High-resolution, clean composition, award ceremony aesthetic.`;

    const apiKey = process.env.MYSHELL_API_KEY || process.env.API_KEY;

    if (!apiKey) {
      console.error('❌ 未配置 API Key，无法调用 Nana Banana Pro');
      return await generateFutureVisionFallback(developerName, topCategory);
    }

    console.log('📡 调用 Nana Banana Pro API...');

    // 调用 MyShell Nana Banana Pro API
    const response = await fetch('https://api.myshell.ai/v1/bots/nana-banana-pro/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '1:1',
        quality: 'high',
        style: 'illustration'
      })
    });

    console.log('📡 Nana Banana Pro API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.warn('⚠️ Nana Banana Pro API 调用失败:', response.status, errorText);
      console.log('🔄 回退到 Gemini 图片生成...');
      return await generateFutureVisionFallback(developerName, topCategory);
    }

    const data = await response.json();
    console.log('✅ Nana Banana Pro 调用成功');
    return data.image_url || data.url || null;
  } catch (error) {
    console.error('❌ 生成开发者头像失败:', error);
    // 回退到 Gemini 图片生成
    console.log('🔄 尝试回退到 Gemini 图片生成...');
    return await generateFutureVisionFallback(developerName, topCategory);
  }
};

/**
 * 使用 Gemini 生成开发者成就图片（备用方案）
 */
async function generateFutureVisionFallback(developerName: string, topCategory: string) {
  try {
    console.log('🔄 使用 Gemini 备用方案生成图片:', { developerName, topCategory });

    if (!process.env.API_KEY) {
      console.error('❌ Gemini API Key 未配置，无法生成备用图片');
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A cinematic 3D masterpiece celebrating the developer "${developerName}".
  The center of the image is a massive, elegant golden trophy.
  Extremely important: The text "${developerName}" MUST be written in huge, clean, bold 3D typography on the body of the trophy.
  A cute high-tech MyShell mascot robot (indigo blue and white) is hugging the trophy excitedly.
  Background: A high-tech stadium with holographic screens displaying "${topCategory}" and floating code particles.
  Lighting: Epic purple and blue spotlights, golden sparkles, confetti.
  Style: 4K Octane render, Pixar movie quality, hyper-realistic textures.
  The name "${developerName}" is the hero of this visual.`;

    console.log('📡 调用 Gemini 图片生成 API...');

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

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log('✅ Gemini 图片生成成功');
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    console.warn('⚠️ Gemini 响应中未找到图片数据');
    return null;
  } catch (error) {
    console.error('❌ Gemini 备用图片生成失败:', error);
    return null;
  }
}

export const generateFutureVision = generateDeveloperAvatar;
