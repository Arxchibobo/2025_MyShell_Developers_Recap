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
 * 使用严谨的工程级 Prompt，避免油腻套话
 */
async function generateThanksLetter(name, botCount, topTag) {
  try {
    console.log(`📝 生成感谢信: ${name}, ${botCount} 个 Bot, 类别: ${topTag}`);

    // 生成 seed 用于随机性控制（基于开发者名字）
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const templateIndex = seed % 5;

    const prompt = `【SYSTEM ROLE】
你是 MyShell 产品系统中的「开发者回顾文案生成模块」。
你的唯一职责是：为单个开发者生成 1 句中文感谢语，用于年终回顾页面。

【核心目标】
- 每一句都不油、不空、不像模板
- 在 1168+ 开发者规模下长期可用
- 同一开发者多次生成时，表达角度不同
- 不追求"感动"，而是"被认真看见"

【输入数据】
{
  "developer_name": "${name}",
  "year": 2025,
  "bot_count": ${botCount},
  "tags": ["${topTag}"],
  "seed": ${seed}
}

【全局硬性约束（不可违反）】
❌ 禁止使用词语：感谢、辛苦、致敬、热爱、激情、一路以来、不负、闪耀、赋能
❌ 禁止营销语、颁奖词语气
❌ 禁止连续使用感叹号（最多 0 个）
❌ 禁止出现「MyShell 社区」「平台愿景」等官方口径

✅ 必须项：
- 仅生成 1 句中文
- 长度 18–42 字
- 可提及「你」，也可省略姓名
- 语言自然、像人工撰写

【语气模板（必须使用其中 1 个）】
模板索引：${templateIndex}

${templateIndex === 0 ? `
🎭 模板 A：记录型（Facts-first）
规则：偏事实，不评价，至少包含数量/时间/方向之一
写作指令：用一句话，记录开发者今年做过的事，不下结论。
` : templateIndex === 1 ? `
🎭 模板 B：侧面认可型（Indirect）
规则：不直接表扬，用结果或状态体现价值
写作指令：用一句话，从旁观者角度表达"这件事不容易忽略"。
` : templateIndex === 2 ? `
🎭 模板 C：长期陪跑型（Consistency）
规则：强调持续性，不写爆点、不写成果大小
写作指令：用一句话表达：你一直在做，我们一直看得到。
` : templateIndex === 3 ? `
🎭 模板 D：选择与判断型（Deliberate）
规则：强调判断、取舍、方向，偏成熟语气
写作指令：用一句话认可开发者的选择与判断，而非结果。
` : `
🎭 模板 E：轻人味型（Human, subtle）
规则：允许轻微人味，不玩梗、不情绪化
写作指令：用一句话，让人感到这是写给"具体的人"。
`}

【数量表达多样化】
- 若 bot_count 接近整十（如 49），可用"近 50 个"或"几十次"
- 或完全不写数量，改为其他角度

【输出格式（严格）】
<生成的一句话中文感谢语>

⚠️ 不要返回 JSON
⚠️ 不要附加解释
⚠️ 不要说明使用了哪种模板

【质量自检】
确认：
1. 这句话不像官方文案
2. 去掉"感谢"二字后仍然成立
3. 读给本人听不会尴尬

现在请生成。`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    let text = response.text.trim();

    // 清理可能的多余符号
    text = text.replace(/^["「『]|["」』]$/g, ''); // 移除首尾引号
    text = text.replace(/\n/g, ''); // 移除换行

    console.log(`✅ 感谢信生成成功 (模板 ${templateIndex}): ${text}`);
    return text;

  } catch (error) {
    console.error('❌ 感谢信生成失败:', error);

    // 备用文案也遵循新规则（不油腻）
    const fallbacks = [
      `你在 ${topTag} 方向持续推进自己的想法，很多成果是自然累积出来的。`,
      `这一年你完成了不少尝试，没有喧哗，但很难被忽略。`,
      `有些创作不是为了速度，而是为了把方向走稳。`,
      `${botCount} 个作品背后，是你对这个方向的持续判断。`,
      `你一直在做，我们一直看得到。`
    ];

    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return fallbacks[seed % fallbacks.length];
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
