
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

export const generateFutureVision = async (wechatName: string, topCategory: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // 极度强化的文字显示提示词
  const prompt = `A cinematic 3D masterpiece celebrating the developer "${wechatName}". 
  The center of the image is a massive, elegant golden trophy. 
  Extremely important: The text "${wechatName}" MUST be written in huge, clean, bold 3D typography on the body of the trophy. 
  A cute high-tech MyShell mascot robot (indigo blue and white) is hugging the trophy excitedly. 
  Background: A high-tech stadium with holographic screens displaying the name "${wechatName}" and floating code particles. 
  Lighting: Epic purple and blue spotlights, golden sparkles, confetti. 
  Style: 4K Octane render, Pixar movie quality, hyper-realistic textures. 
  The name "${wechatName}" is the hero of this visual.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
