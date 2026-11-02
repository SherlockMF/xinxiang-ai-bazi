// LLM Prompt 工具函数
// 生成禅意古风的偈语与运势提示

import type { BaziProfile, DailyFortune } from '../types/index.ts';
import { getElementLabel } from '../types/index.ts';

// 心象偈语库
const CYBER_BLESSINGS_HIGH = [
  '心象清明，如月印千江。今日诸事顺势，且以从容之心承之。',
  '气数正盛，天地与你相和。所遇皆是良缘，安然受之，不必拘执。',
  '此日如春水初生，万物向荣。心中所念正悄然舒展，静待花开便是。'
];

const CYBER_BLESSINGS_MEDIUM = [
  '今日气息平和，如静水深流。无需用力，顺其自然亦是修行。',
  '心象处于中和之境，宜沉心静养。守得云开，自有月明。',
  '不求圆满，但求安然。今日宜把心放宽，于平淡处见真味。'
];

const CYBER_BLESSINGS_LOW = [
  '心象微澜，如风过竹林。此非坎坷，乃天地提醒你返照内心。',
  '今日气数内敛，正是闭门养神之时。守静以待，自能转圜。',
  '云遮月明本是常态，不必忧心。且安顿身心，静候云散月出。'
];

// 快捷问题（4 类自我观察）
const QUICK_QUESTIONS = [
  '今天适合主动联系对方吗？',
  '今天适合推进重要事情吗？',
  '我现在为什么有点不安？',
  '今天沟通要注意什么？'
];

/**
 * 生成心象偈语
 */
export function generateCyberBlessing(score: number, rand?: () => number): string {
  let pool: string[];

  if (score >= 80) {
    pool = CYBER_BLESSINGS_HIGH;
  } else if (score >= 70) {
    pool = CYBER_BLESSINGS_MEDIUM;
  } else {
    pool = CYBER_BLESSINGS_LOW;
  }

  const pick = rand ?? Math.random;
  return pool[Math.floor(pick() * pool.length)];
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
- 喜用五行：${bazi.favorableElements.map(getElementLabel).join('、')}
- 性格标签：${bazi.personalityTags.join('、')}
- 命盘摘要：${bazi.summary}

日期：${date}

要求：
1. 生成今日运势，包含：综合分数（60-90）、情绪关键词、运势摘要、今日宜（3-5条）、今日忌（2-3条）、幸运色、幸运数字、幸运方向、行动建议、心象偈语
2. 文风带禅意与传统文化的神秘古意：用词凝练含蓄，可化用「心、象、气、神、月、水、风、云」等意象，可点缀文言语感，但须自然不晦涩、不堆砌
3. 语气温柔、有陪伴感，不使用绝对化、恐吓式表述（忌「大凶、必、务必」等）
4. 内容要与用户的五行特点相关
5. 返回 JSON 格式
6. 在偈语中以含蓄方式提醒"所言仅为遣怀清心，非关休咎"`;
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
2. 文风温柔含蓄，带禅意与传统古意，可化用自然意象，但自然不晦涩
3. 不使用绝对化、恐吓式表述
4. 以情绪陪伴和行动建议为主
5. 结尾以含蓄方式提醒"所言仅为遣怀清心，非关决断"`;
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
