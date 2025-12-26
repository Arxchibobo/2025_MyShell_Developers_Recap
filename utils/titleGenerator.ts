/**
 * MyShell Title 生成系统
 * 根据开发者的 bot 数量和创作类型生成专属称号
 */

export interface TitleInfo {
  name: string;        // 称号名称
  emoji: string;       // 称号图标
  description: string; // 称号描述
  rarity: 'common' | 'rare' | 'epic' | 'legendary'; // 稀有度
}

/**
 * 根据 bot 数量和主要标签生成称号
 */
export function generateTitle(botCount: number, topTag: string): TitleInfo {
  // 传奇级别称号（80+ bots）
  if (botCount >= 80) {
    return {
      name: '银河建筑师',
      emoji: '🌌',
      description: '创造了一个完整的智能宇宙',
      rarity: 'legendary'
    };
  }

  // 史诗级别称号（50-79 bots）
  if (botCount >= 50) {
    return {
      name: '生态系统构建者',
      emoji: '🏗️',
      description: '塑造了 MyShell 的未来形态',
      rarity: 'epic'
    };
  }

  // 稀有级别称号（25-49 bots）
  if (botCount >= 25) {
    const tagLower = topTag.toLowerCase();
    if (tagLower.includes('beauty')) {
      return {
        name: '美学大师',
        emoji: '🎨',
        description: '用代码诠释美的定义',
        rarity: 'rare'
      };
    } else if (tagLower.includes('tool') || tagLower.includes('productivity')) {
      return {
        name: '效率革命者',
        emoji: '⚡',
        description: '重新定义生产力的边界',
        rarity: 'rare'
      };
    } else if (tagLower.includes('game') || tagLower.includes('entertainment')) {
      return {
        name: '欢乐制造机',
        emoji: '🎮',
        description: '创造无尽的快乐时光',
        rarity: 'rare'
      };
    } else {
      return {
        name: 'AI 领航者',
        emoji: '🧭',
        description: '探索智能的无限可能',
        rarity: 'rare'
      };
    }
  }

  // 普通级别称号（10-24 bots）
  if (botCount >= 10) {
    return {
      name: '创意火种',
      emoji: '🔥',
      description: '用热情点燃创新之光',
      rarity: 'common'
    };
  }

  // 新手称号（1-9 bots）
  return {
    name: '初心探索者',
    emoji: '🌟',
    description: '迈出了改变世界的第一步',
    rarity: 'common'
  };
}

/**
 * 获取稀有度颜色
 */
export function getRarityColor(rarity: TitleInfo['rarity']): {
  text: string;
  bg: string;
  border: string;
  glow: string;
} {
  switch (rarity) {
    case 'legendary':
      return {
        text: 'text-yellow-300',
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        glow: 'shadow-[0_0_60px_rgba(234,179,8,0.3)]'
      };
    case 'epic':
      return {
        text: 'text-purple-300',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/30',
        glow: 'shadow-[0_0_60px_rgba(168,85,247,0.3)]'
      };
    case 'rare':
      return {
        text: 'text-blue-300',
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        glow: 'shadow-[0_0_60px_rgba(59,130,246,0.3)]'
      };
    default:
      return {
        text: 'text-gray-300',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/30',
        glow: 'shadow-[0_0_60px_rgba(107,114,128,0.2)]'
      };
  }
}

/**
 * 获取稀有度文本
 */
export function getRarityText(rarity: TitleInfo['rarity']): string {
  switch (rarity) {
    case 'legendary':
      return '传奇';
    case 'epic':
      return '史诗';
    case 'rare':
      return '稀有';
    default:
      return '普通';
  }
}
