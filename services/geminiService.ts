
import { GoogleGenAI, Type } from "@google/genai";

export const getGeminiResponse = async (prompt: string, model: string = 'gemini-3-flash-preview') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text;
};

export const generateArchetypeSummary = async (name: string, botCount: number, topTag: string) => {
  const prompt = `你是一位 MyShell 社区首席官。正在为 2025 年度总结撰写致辞。
  目标对象：开发者 "${name}"。
  成就：贡献了 ${botCount} 个 Bot。
  核心领域：${topTag}。
  请写一段简短有力的中文感谢信（50-80字）。
  要求包含：名字 "${name}"、数字 "${botCount}"、关键词“创意火种”、“智能版图”。
  语气：激动人心且富有敬意。`;
  
  return await getGeminiResponse(prompt, 'gemini-3-flash-preview');
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

    // 调用 MyShell Nana Banana Pro API
    const response = await fetch('https://api.myshell.ai/v1/bots/nana-banana-pro/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MYSHELL_API_KEY || process.env.API_KEY}`
      },
      body: JSON.stringify({
        prompt,
        aspect_ratio: '1:1',
        quality: 'high',
        style: 'illustration'
      })
    });

    if (!response.ok) {
      console.warn('Nana Banana Pro API 调用失败，回退到 Gemini 图片生成');
      return await generateFutureVisionFallback(developerName, topCategory);
    }

    const data = await response.json();
    return data.image_url || data.url || null;
  } catch (error) {
    console.error('生成开发者头像失败:', error);
    // 回退到 Gemini 图片生成
    return await generateFutureVisionFallback(developerName, topCategory);
  }
};

/**
 * 使用 Gemini 生成开发者成就图片（备用方案）
 */
async function generateFutureVisionFallback(developerName: string, topCategory: string) {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export const generateFutureVision = generateDeveloperAvatar;
