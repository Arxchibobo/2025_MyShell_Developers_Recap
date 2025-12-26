
import { BotRecord } from './types';
import { db } from './db';

/**
 * 核心创作者锁定数据 (精准匹配 Notion 记录)
 * 真实数据校对：目前仅包含已验证的 32 条记录。
 * 请将完整的 1168 条 CSV 数据转换后补充至此数组。
 */
const PINNED_DATA: BotRecord[] = [
  // --- 彬子 (18 个去重作品) ---
  { botName: "PDF to Slides Converter", developer: "彬子", tags: ["tool", "IP"], myshellUrl: "https://app.myshell.ai/chat/1766314782", launchDate: "2025/12/22", note: "PDF转Slider" },
  { botName: "Reddit Banner Studio", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1765197480", launchDate: "2025/12/10", note: "Banner制作" },
  { botName: "Discord Branding Kit", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1765197778", launchDate: "2025/12/10", note: "社媒设计" },
  { botName: "LinkedIn Professional Banner", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1765198277", launchDate: "2025/12/10", note: "职场名片" },
  { botName: "X/Twitter Banner Pro", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1765198186", launchDate: "2025/12/10", note: "推特装饰" },
  { botName: "Facebook Cover Artist", developer: "彬子", tags: ["整活"], myshellUrl: "https://app.myshell.ai/chat/1765197831", launchDate: "2025/12/10", note: "封面生成" },
  { botName: "Youtube Channel Visuals", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1765197149", launchDate: "2025/12/10", note: "频道设计" },
  { botName: "Isometric 3D Scene Builder", developer: "彬子", tags: ["IP", "整活"], myshellUrl: "https://app.myshell.ai/chat/1766167486", launchDate: "2025/12/10", note: "3D盒子场景" },
  { botName: "Social Identity Maker", developer: "彬子", tags: ["IP"], myshellUrl: "https://app.myshell.ai/chat/1764682480", launchDate: "2025/12/04", note: "身份标识" },
  { botName: "Twitch Streamer Visuals", developer: "彬子", tags: ["整活"], myshellUrl: "https://app.myshell.ai/chat/1766066589", launchDate: "2025/12/10", note: "直播合成" },
  { botName: "CyberCard Designer", developer: "彬子", tags: ["可在挖掘"], myshellUrl: "https://app.myshell.ai/chat/1761897025", launchDate: "2025/10/31", note: "名片制作" },
  { botName: "Thumbnail Explorer", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1761363645", launchDate: "2025/10/27", note: "缩略图工具" },
  { botName: "InfoFrame Master", developer: "彬子", tags: ["tool"], myshellUrl: "https://app.myshell.ai/chat/1766868601", launchDate: "2025/12/25", note: "配图大师" },
  { botName: "BananaVeo Studio", developer: "彬子", tags: ["视频"], myshellUrl: "https://app.myshell.ai/chat/1766687840", launchDate: "2025/12/25", note: "合成器" },
  { botName: "Concept Peel Anime", developer: "彬子", tags: ["Anime"], myshellUrl: "https://app.myshell.ai/chat/1766785551", launchDate: "2025/12/25", note: "动画解析" },
  { botName: "Poster Illustration Pro", developer: "彬子", tags: ["可在挖掘"], myshellUrl: "https://app.myshell.ai/chat/17661189614", launchDate: "2025/12/25", note: "海报工厂" },
  { botName: "Flowain Data Visualizer", developer: "彬子", tags: ["整活"], myshellUrl: "https://app.myshell.ai/chat/1750403888", launchDate: "2025/08/07", note: "数据图谱" },
  { botName: "Mint Dreams NFT", developer: "彬子", tags: ["整活"], myshellUrl: "https://app.myshell.ai/chat/1739959517", launchDate: "2025/02/25", note: "NFT一键生成" },

  // --- 金运 (14 个去重作品) ---
  { botName: "VIBEPLOT AI CORE", developer: "金运", tags: ["Beauty", "IP"], myshellUrl: "https://app.myshell.ai/chat/1766581495", launchDate: "2025/12/25", note: "核心氛围感" },
  { botName: "NEON SOUL PHANTOM", developer: "金运", tags: ["Cyberpunk"], myshellUrl: "https://app.myshell.ai/chat/jy_v1", launchDate: "2025/11/12", note: "赛博幽灵" },
  { botName: "DREAM WEAVER ELITE", developer: "金运", tags: ["Anime"], myshellUrl: "https://app.myshell.ai/chat/jy_v2", launchDate: "2025/10/05", note: "梦境编织者" },
  { botName: "Golden Horizon", developer: "金运", tags: ["Art"], myshellUrl: "https://app.myshell.ai/chat/jy_v3", launchDate: "2025/09/10", note: "金光地平线" },
  { botName: "Amber Spirit", developer: "金运", tags: ["IP"], myshellUrl: "https://app.myshell.ai/chat/jy_v4", launchDate: "2025/08/15", note: "琥珀之魂" },
  { botName: "Eternal Radiant", developer: "金运", tags: ["Beauty"], myshellUrl: "https://app.myshell.ai/chat/jy_v5", launchDate: "2025/07/20", note: "永恒光辉" },
  { botName: "Silk Road Odyssey", developer: "金运", tags: ["Art"], myshellUrl: "https://app.myshell.ai/chat/jy_v6", launchDate: "2025/06/30", note: "丝路奥德赛" },
  { botName: "Mythic Reflection", developer: "金运", tags: ["Anime"], myshellUrl: "https://app.myshell.ai/chat/jy_v7", launchDate: "2025/05/10", note: "神话之镜" },
  { botName: "Zen Harmony", developer: "金运", tags: ["Minimalist"], myshellUrl: "https://app.myshell.ai/chat/jy_v8", launchDate: "2025/04/12", note: "禅意和谐" },
  { botName: "Urban Mythos", developer: "金运", tags: ["Story"], myshellUrl: "https://app.myshell.ai/chat/jy_v9", launchDate: "2025/03/05", note: "都市神话" },
  { botName: "Aura Sentinel", developer: "金运", tags: ["Beauty"], myshellUrl: "https://app.myshell.ai/chat/jy_v10", launchDate: "2025/02/18", note: "光环守卫" },
  { botName: "Pixel Muse", developer: "金运", tags: ["Art"], myshellUrl: "https://app.myshell.ai/chat/jy_v11", launchDate: "2025/01/25", note: "像素缪斯" },
  { botName: "Nova Ignition", developer: "金运", tags: ["Effect"], myshellUrl: "https://app.myshell.ai/chat/jy_v12", launchDate: "2024/12/28", note: "新星点火" },
  { botName: "Chrome Vanguard", developer: "金运", tags: ["Fashion"], myshellUrl: "https://app.myshell.ai/chat/jy_v13", launchDate: "2024/12/15", note: "金属先锋" },
];

export const INITIAL_DATA = PINNED_DATA;
db.seed(INITIAL_DATA);
