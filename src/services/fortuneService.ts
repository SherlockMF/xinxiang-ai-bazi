// 每日运势生成服务 - fortuneService
// 根据八字档案生成个性化每日运势

import type { BaziProfile, DailyFortune, FiveElementType } from '../types';
import { getElementLabel } from '../types';
import { generateCyberBlessing } from './llmPromptUtils';
import { storage } from './storageAdapter';

// 本地存储 key
const FORTUNE_CACHE_KEY = 'cyber_fortune_cache';

// 五行对应的运势倾向
const ELEMENT_FORTUNE_TENDENCY: Record<string, { positive: string[]; negative: string[] }> = {
  wood: {
    positive: ['开展新项目', '学习新技能', '社交活动', '创意表达', '户外运动'],
    negative: ['过度竞争', '冲动决策', '与人争执']
  },
  fire: {
    positive: ['表达想法', '团队协作', '展示才华', '传递温暖', '光明活动'],
    negative: ['情绪爆发', '过度承诺', '熬夜透支']
  },
  earth: {
    positive: ['整理收纳', '巩固关系', '务实规划', '稳健投资', '承担责任'],
    negative: ['过度保守', '拖延行动', '固守旧念']
  },
  metal: {
    positive: ['果断决策', '追求品质', '提升效率', '整理边界', '设立规则'],
    negative: ['过度批判', '苛求完美', '拒绝妥协']
  },
  water: {
    positive: ['深度思考', '灵活应变', '沟通协调', '学习吸收', '静心沉淀'],
    negative: ['过度担忧', '思绪飘散', '情绪内耗']
  }
};

// 幸运颜色库
const LUCKY_COLORS: Record<string, string[]> = {
  wood: ['绿色', '青色', '翠绿', '薄荷绿'],
  fire: ['红色', '紫色', '橙色', '玫红'],
  earth: ['黄色', '棕色', '米色', '咖啡色'],
  metal: ['白色', '银色', '金色', '浅灰'],
  water: ['蓝色', '黑色', '深蓝', '墨绿']
};

// 幸运方向库
const LUCKY_DIRECTIONS: Record<string, string[]> = {
  wood: ['东方', '东南方'],
  fire: ['南方'],
  earth: ['中央', '东北方', '西南方'],
  metal: ['西方', '西北方'],
  water: ['北方']
};

// 情绪关键词库
const MOOD_KEYWORDS: string[] = [
  '静谧流动', '温暖涌动', '稳重安和', '清晰锐利', '深沉洞察',
  '灵感迸发', '情绪波动', '平和自在', '能量收敛', '灵动舒展'
];

/**
 * 获取缓存运势
 */
export function getCachedFortune(userId: string, date: string): DailyFortune | null {
  try {
    const cache = storage.getItem(FORTUNE_CACHE_KEY);
    if (!cache) return null;
    
    const parsed = JSON.parse(cache);
    const key = `${userId}_${date}`;
    return parsed[key] || null;
  } catch {
    return null;
  }
}

/**
 * 缓存运势
 */
export function cacheFortune(fortune: DailyFortune): void {
  try {
    const cache = storage.getItem(FORTUNE_CACHE_KEY) || '{}';
    const parsed = JSON.parse(cache);
    const key = `${fortune.userId}_${fortune.date}`;
    parsed[key] = fortune;
    storage.setItem(FORTUNE_CACHE_KEY, JSON.stringify(parsed));
  } catch {
    // 缓存失败不影响主流程
  }
}

/**
 * 生成今日宜（基于五行）
 */
function generateYi(bazi: BaziProfile): string[] {
  const favorable = bazi.favorableElements;
  const yi: string[] = [];
  
  favorable.forEach(element => {
    const tendency = ELEMENT_FORTUNE_TENDENCY[element];
    if (tendency) {
      // 随机选取2-3个
      const shuffled = [...tendency.positive].sort(() => Math.random() - 0.5);
      yi.push(...shuffled.slice(0, 2));
    }
  });
  
  // 添加通用宜
  yi.push('保持正念', '顺应流');
  
  return yi.slice(0, 5);
}

/**
 * 生成今日忌（基于五行）
 */
function generateJi(bazi: BaziProfile): string[] {
  const favorable = bazi.favorableElements;
  const ji: string[] = [];
  
  // 找相反的五行
  const elements: FiveElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const unfavorable = elements.filter(e => !favorable.includes(e)).slice(0, 2);
  
  unfavorable.forEach(element => {
    const tendency = ELEMENT_FORTUNE_TENDENCY[element];
    if (tendency) {
      const shuffled = [...tendency.negative].sort(() => Math.random() - 0.5);
      ji.push(...shuffled.slice(0, 1));
    }
  });
  
  // 添加通用忌
  ji.push('情绪内耗');
  
  return ji.slice(0, 3);
}

/**
 * 生成幸运色
 */
function generateLuckyColor(bazi: BaziProfile): string {
  const element = bazi.favorableElements[0] || 'water';
  const colors = LUCKY_COLORS[element] || LUCKY_COLORS.water;
  return colors[Math.floor(Math.random() * colors.length)];
}

/**
 * 生成幸运数字
 */
function generateLuckyNumber(bazi: BaziProfile): number {
  // 五行对应数字
  const elementNumbers: Record<string, number[]> = {
    wood: [3, 8],
    fire: [2, 7],
    earth: [5, 6],
    metal: [4, 9],
    water: [1, 6]
  };
  
  const element = bazi.favorableElements[0] || 'water';
  const numbers = elementNumbers[element] || [1, 6];
  return numbers[Math.floor(Math.random() * numbers.length)];
}

/**
 * 生成幸运方向
 */
function generateLuckyDirection(bazi: BaziProfile): string {
  const element = bazi.favorableElements[0] || 'water';
  const directions = LUCKY_DIRECTIONS[element] || LUCKY_DIRECTIONS.water;
  return directions[Math.floor(Math.random() * directions.length)];
}

/**
 * 生成情绪关键词
 */
function generateMoodKeyword(): string {
  return MOOD_KEYWORDS[Math.floor(Math.random() * MOOD_KEYWORDS.length)];
}

/**
 * 生成综合分数（60-90区间为主）
 */
function generateOverallScore(bazi: BaziProfile): number {
  // 基于五行平衡度调整分数
  const elements = Object.values(bazi.fiveElements);
  const maxDiff = Math.max(...elements) - Math.min(...elements);
  
  // 平衡度高则分数高
  const baseScore = 75 - maxDiff;
  const randomOffset = Math.floor(Math.random() * 10) - 5;
  
  return Math.max(60, Math.min(90, baseScore + randomOffset));
}

/**
 * 生成运势摘要
 */
function generateSummary(bazi: BaziProfile, score: number): string {
  const element = bazi.favorableElements[0] || 'water';
  const elementNames: Record<string, string> = {
    wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
  };
  
  let trendDesc = '';
  if (score >= 80) {
    trendDesc = '今日能量流动顺畅，适合发挥你的特质';
  } else if (score >= 70) {
    trendDesc = '今日整体平稳，保持觉知即可';
  } else {
    trendDesc = '今日能量有波动，建议多关注内心';
  }
  
  return `你的${elementNames[element]}气今日${score >= 75 ? '升腾' : '收敛'}。${trendDesc}。${bazi.personalityTags[0]}的你，今天适合${bazi.favorableElements.includes('water') ? '静心思考' : '积极表达'}。`;
}

/**
 * 生成行动建议
 */
function generateActionSuggestion(bazi: BaziProfile): string {
  const suggestions: string[] = [
    '早晨醒来后，花3分钟感受今日的能量状态',
    '在重要决策前，先让情绪沉淀一下',
    '与他人交流时，保持温和的边界感',
    '完成一件事后，给自己一个小小的庆祝仪式',
    '睡前回顾今日的心流时刻，写下3个收获',
    '遇到不确定时，信任直觉的微妙信号',
    '安排一段独处时间，让思绪自然流动',
    '尝试用新的角度看待熟悉的日常'
  ];
  
  // 基于五行选择建议
  const element = bazi.favorableElements[0] || 'water';
  const index = ['wood', 'fire', 'earth', 'metal', 'water'].indexOf(element);
  
  return suggestions[index] || suggestions[0];
}

/**
 * 生成每日运势
 * MVP 版本：使用本地算法 + 模板生成，后续接入 LLM
 * @param force 为 true 时跳过缓存，强制重新生成并覆盖当天缓存（用于"重新生成"按钮）
 */
export async function generateDailyFortune(bazi: BaziProfile, date: string, force = false): Promise<DailyFortune> {
  // 默认读取缓存；force=true 时跳过缓存
  if (!force) {
    const cached = getCachedFortune(bazi.userId, date);
    if (cached) {
      return cached;
    }
  }

  const score = generateOverallScore(bazi);
  const yi = generateYi(bazi);
  const ji = generateJi(bazi);
  
  const fortune: DailyFortune = {
    id: `fortune_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId: bazi.userId,
    date,
    overallScore: score,
    moodKeyword: generateMoodKeyword(),
    summary: generateSummary(bazi, score),
    yi,
    ji,
    luckyColor: generateLuckyColor(bazi),
    luckyNumber: generateLuckyNumber(bazi),
    luckyDirection: generateLuckyDirection(bazi),
    actionSuggestion: generateActionSuggestion(bazi),
    cyberBlessing: generateCyberBlessing(score),
    createdAt: new Date().toISOString()
  };
  
  // 缓存运势
  cacheFortune(fortune);
  
  return fortune;
}

/**
 * 生成宜忌解释
 */
export async function explainYiJi(
  bazi: BaziProfile,
  _fortune: DailyFortune,
  item: string,
  type: 'yi' | 'ji'
): Promise<string> {
  // MVP 版本：使用模板解释
  // 喜用五行为英文枚举，展示时转为中文 label
  const favorableLabel = bazi.favorableElements[0] ? getElementLabel(bazi.favorableElements[0]) : '水';
  const templates: Record<string, string[]> = {
    yi: [
      `"${item}"与你的${favorableLabel}气相和。今天做这件事时，你会感受到能量的自然流动，不需要刻意用力。保持轻松的心态，让这件事成为你今日的能量补给站。`,
      `你的日主${bazi.dayMaster}今天与"${item}"的能量频率共振。这不是硬性要求，而是顺势而为的温柔提示。如果你今天有这方面的计划，现在是个不错的时机。`,
      `"${item}"能帮助你今日的能量状态更加平衡。不需要追求完美结果，过程中的感受才是真正有价值的部分。给自己一点时间，慢慢体验。`
    ],
    ji: [
      `"${item}"可能会消耗你今日的能量储备。这不是说这件事绝对不能做，而是提醒你：如果必须做，请给自己多一点缓冲空间，不要勉强。`,
      `今天你的${favorableLabel}气不太适合"${item}"。如果这件事出现在你的计划中，可以试着换个角度，或者推迟到能量更充沛的时候。`,
      `"${item}"与今日的能量流向有些冲突。如果你发现自己在这件事上遇到阻力，不必焦虑。这只是能量的自然调节，休息一下，换个方式试试。`
    ]
  };
  
  const selected = templates[type];
  return selected[Math.floor(Math.random() * selected.length)];
}