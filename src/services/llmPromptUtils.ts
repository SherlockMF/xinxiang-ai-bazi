// LLM Prompt 工具函数
// 生成赛博风格的祝福语和运势提示

import type { BaziProfile, DailyFortune } from '../types';

// 赛博祝福语库
const CYBER_BLESSINGS_HIGH = [
  '今日能量场正与你的命盘共振，数字星辰为你绘制了一条灵频上升的轨迹。保持觉知，顺应流动。',
  '霓虹数据流中，你的灵频指标持续走高。这不是命运预测，而是宇宙给你的温柔提醒：你正处于能量充沛的状态。',
  '命盘算法显示今日是你的灵频峰值日。在虚拟与现实的交界处，有一股温暖的力量正向你汇聚。'
];

const CYBER_BLESSINGS_MEDIUM = [
  '今日的能量流动平稳，像一条静谧的数据流穿过你的命盘。不需要刻意用力，保持顺势即可。',
  '灵频扫描显示今日能量处于平衡态。这是静心沉淀的好时机，让思绪像数据一样有序流动。',
  '命盘计算表明今日能量适中。不必追求极致，保持在舒适区就好。这只是一次温柔的频率校准。'
];

const CYBER_BLESSINGS_LOW = [
  '今日能量场有轻微波动，像电路中的微小电阻。这不是问题，而是提醒你多关注内心状态的信号。',
  '灵频监测显示今日能量收敛。这是内观的好时机，在数据流动中找到你的平衡点。',
  '命盘算法提示今日能量略有波动。不必焦虑，这只是能量场的自然调节。给自己多一点耐心。'
];

// 快捷问题模板
const QUICK_QUESTIONS = [
  '今天适合表白吗？',
  '今天工作要注意什么？',
  '我今天情绪很低怎么办？'
];

/**
 * 生成赛博祝福语
 */
export function generateCyberBlessing(score: number): string {
  let pool: string[];
  
  if (score >= 80) {
    pool = CYBER_BLESSINGS_HIGH;
  } else if (score >= 70) {
    pool = CYBER_BLESSINGS_MEDIUM;
  } else {
    pool = CYBER_BLESSINGS_LOW;
  }
  
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * 生成运势提示 Prompt（供 LLM 使用）
 */
export function generateFortunePrompt(bazi: BaziProfile, date: string): string {
  return `请为以下用户生成今日运势分析：
  
用户八字：
- 年柱：${bazi.yearPillar}
- 月柱：${bazi.monthPillar}
- 日柱：${bazi.dayPillar}
- 时柱：${bazi.hourPillar}
- 日主：${bazi.dayMaster}
- 五行能量：木${bazi.fiveElements.wood}% 火${bazi.fiveElements.fire}% 土${bazi.fiveElements.earth}% 金${bazi.fiveElements.metal}% 水${bazi.fiveElements.water}%
- 喜用五行：${bazi.favorableElements.join('、')}
- 性格标签：${bazi.personalityTags.join('、')}
- 命盘摘要：${bazi.summary}

日期：${date}

要求：
1. 生成今日运势，包含：综合分数（60-90）、情绪关键词、运势摘要、今日宜（3-5条）、今日忌（2-3条）、幸运色、幸运数字、幸运方向、行动建议、赛博祝福语
2. 语气温柔、陪伴感，不使用绝对化表述
3. 内容要与用户的五行特点相关
4. 返回 JSON 格式
5. 在祝福语中强调"这只是娱乐参考"`;
}

/**
 * 生成 AI 解读 Prompt
 */
export function generateAIExplanationPrompt(
  bazi: BaziProfile,
  fortune: DailyFortune,
  question: string
): string {
  return `用户问题：${question}

用户八字：${JSON.stringify(bazi)}
今日运势：${JSON.stringify(fortune)}

请结合八字和运势回答用户问题。
要求：
1. 150 字以内
2. 语气温柔、陪伴感
3. 不使用绝对化、恐吓式表述
4. 以情绪陪伴和行动建议为主
5. 结尾提醒"这只是娱乐参考，不是决策依据"`;
}

/**
 * 获取快捷问题列表
 */
export function getQuickQuestions(): string[] {
  return QUICK_QUESTIONS;
}

/**
 * 生成本地存储 Key
 */
export function generateStorageKey(userId: string, type: string, date?: string): string {
  const prefix = 'cyber_freq';
  if (date) {
    return `${prefix}_${userId}_${type}_${date}`;
  }
  return `${prefix}_${userId}_${type}`;
}