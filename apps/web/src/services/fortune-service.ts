// 每日心象生成服务 - fortuneService
// 根据八字档案 + 出生信息生成个性化每日心象（稳定 seed，同日不变）

import type { BaziProfile, DailyFortune, FiveElementType, UserProfile } from '../types/index.ts';
import { getElementLabel } from '../types/index.ts';
import { buildDailySeed, createSeededRandom, seededPick, seededPickOne } from './birth-utils.ts';
import { generateCyberBlessing } from './llm-prompt-utils.ts';
import { getDailyFortune, saveDailyFortune } from './storage-service.ts';
import { sanitizeFortuneTextFields } from './content-safety.ts';

const ELEMENT_FORTUNE_TENDENCY: Record<string, { positive: string[]; negative: string[] }> = {
  wood: {
    positive: ['启新', '问学', '会友', '舒展', '亲木'],
    negative: ['争竞', '躁进', '强求']
  },
  fire: {
    positive: ['言志', '相聚', '显才', '暖人', '向阳'],
    negative: ['急怒', '轻诺', '耗神']
  },
  earth: {
    positive: ['归整', '固本', '务实', '守诺', '安居'],
    negative: ['滞守', '迟疑', '执旧']
  },
  metal: {
    positive: ['决断', '删繁', '立界', '循礼', '修身'],
    negative: ['苛察', '求全', '拒和']
  },
  water: {
    positive: ['静思', '应变', '通和', '纳新', '沉心'],
    negative: ['多虑', '散神', '内耗']
  }
};

const LUCKY_COLORS: Record<string, string[]> = {
  wood: ['竹青', '松绿', '缥碧', '艾绿'],
  fire: ['绛红', '朱砂', '胭脂', '茜色'],
  earth: ['赭黄', '秋香', '缃色', '黄栌'],
  metal: ['月白', '素银', '缟素', '霜色'],
  water: ['黛蓝', '靛青', '玄色', '黛色']
};

const LUCKY_DIRECTIONS: Record<string, string[]> = {
  wood: ['东方', '东南方'],
  fire: ['南方'],
  earth: ['中央', '东北方', '西南方'],
  metal: ['西方', '西北方'],
  water: ['北方']
};

const MOOD_KEYWORDS: string[] = [
  '静水流深',
  '心如止水',
  '风过无痕',
  '月明心澈',
  '云淡风轻',
  '气敛神藏',
  '潜龙在渊',
  '灵光乍现',
  '心起微澜',
  '舒卷自如'
];

function resolveTimeBranch(userProfile: UserProfile): string {
  if (userProfile.unknownTime) return 'unknown';
  return userProfile.timeBranch || 'unknown';
}

function generateYi(bazi: BaziProfile, rand: () => number): string[] {
  const yi: string[] = [];
  bazi.favorableElements.forEach((element) => {
    const tendency = ELEMENT_FORTUNE_TENDENCY[element];
    if (tendency) {
      yi.push(...seededPick(tendency.positive, 2, rand));
    }
  });
  yi.push('守正', '顺势');
  return yi.slice(0, 5);
}

function generateJi(bazi: BaziProfile, rand: () => number): string[] {
  const favorable = bazi.favorableElements;
  const ji: string[] = [];
  const elements: FiveElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
  const unfavorable = elements.filter((e) => !favorable.includes(e)).slice(0, 2);

  unfavorable.forEach((element) => {
    const tendency = ELEMENT_FORTUNE_TENDENCY[element];
    if (tendency) {
      ji.push(...seededPick(tendency.negative, 1, rand));
    }
  });
  ji.push('神耗');
  return ji.slice(0, 3);
}

function generateLuckyColor(bazi: BaziProfile, rand: () => number): string {
  const element = bazi.favorableElements[0] || 'water';
  const colors = LUCKY_COLORS[element] || LUCKY_COLORS.water;
  return seededPickOne(colors, rand);
}

function generateLuckyNumber(bazi: BaziProfile, rand: () => number): number {
  const elementNumbers: Record<string, number[]> = {
    wood: [3, 8],
    fire: [2, 7],
    earth: [5, 6],
    metal: [4, 9],
    water: [1, 6]
  };
  const element = bazi.favorableElements[0] || 'water';
  const numbers = elementNumbers[element] || [1, 6];
  return seededPickOne(numbers, rand);
}

function generateLuckyDirection(bazi: BaziProfile, rand: () => number): string {
  const element = bazi.favorableElements[0] || 'water';
  const directions = LUCKY_DIRECTIONS[element] || LUCKY_DIRECTIONS.water;
  return seededPickOne(directions, rand);
}

function generateMoodKeyword(rand: () => number): string {
  return seededPickOne(MOOD_KEYWORDS, rand);
}

function generateOverallScore(bazi: BaziProfile, rand: () => number): number {
  const elements = Object.values(bazi.fiveElements);
  const maxDiff = Math.max(...elements) - Math.min(...elements);
  const baseScore = 75 - maxDiff;
  const randomOffset = Math.floor(rand() * 10) - 5;
  return Math.max(60, Math.min(90, baseScore + randomOffset));
}

function generateSummary(bazi: BaziProfile, score: number): string {
  const element = bazi.favorableElements[0] || 'water';
  const elementNames: Record<string, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
  };
  const trendWord = score >= 80 ? '舒展升腾' : score >= 70 ? '中和平稳' : '内敛微澜';
  const advice = bazi.favorableElements.includes('water') ? '宜静思以养神' : '宜舒展以应时';
  return `${elementNames[element]}气今日${score >= 75 ? '升' : '敛'}，气数${trendWord}。${advice}，顺其势而不强求。`;
}

function generateActionSuggestion(bazi: BaziProfile): string {
  const suggestions: Record<FiveElementType, string> = {
    wood: '晨起舒展四体，纳一口清气，任生意自生。',
    fire: '言语之前，先令心火沉一沉，话到温处自暖人。',
    earth: '择一事踏实做完，心自安稳，不必贪多。',
    metal: '删去一桩冗事，立一分清界，身心自轻。',
    water: '辟一段独处，静观思绪如水来去，不滞不留。'
  };
  const element = bazi.favorableElements[0] || 'water';
  return suggestions[element] || suggestions.water;
}

/**
 * 生成每日心象
 * @param force 为 true 时跳过缓存，强制重新生成
 */
export async function generateDailyFortune(
  bazi: BaziProfile,
  userProfile: UserProfile,
  date: string,
  force = false
): Promise<DailyFortune> {
  const timeBranch = resolveTimeBranch(userProfile);

  if (!force) {
    const cached = getDailyFortune(bazi.userId, date, userProfile.birthDate, timeBranch);
    if (cached) return sanitizeFortuneTextFields(cached);
  }

  const seed = buildDailySeed(userProfile, date);
  const rand = createSeededRandom(seed);

  const score = generateOverallScore(bazi, rand);
  const yi = generateYi(bazi, rand);
  const ji = generateJi(bazi, rand);

  const fortune: DailyFortune = {
    id: `fortune_${seed}`,
    userId: bazi.userId,
    date,
    overallScore: score,
    moodKeyword: generateMoodKeyword(rand),
    summary: generateSummary(bazi, score),
    yi,
    ji,
    luckyColor: generateLuckyColor(bazi, rand),
    luckyNumber: generateLuckyNumber(bazi, rand),
    luckyDirection: generateLuckyDirection(bazi, rand),
    actionSuggestion: generateActionSuggestion(bazi),
    cyberBlessing: generateCyberBlessing(score, rand),
    createdAt: new Date().toISOString()
  };

  const safeFortune = sanitizeFortuneTextFields(fortune);
  saveDailyFortune(safeFortune, userProfile.birthDate, timeBranch);
  return safeFortune;
}

/** @deprecated 请使用 storageService.getDailyFortune */
export function getCachedFortune(userId: string, date: string): DailyFortune | null {
  return getDailyFortune(userId, date, '', 'unknown');
}

/** @deprecated 请使用 storageService.saveDailyFortune */
export function cacheFortune(fortune: DailyFortune): void {
  saveDailyFortune(fortune, '', 'unknown');
}

/**
 * 生成宜忌解释（稳定 seed）
 */
export async function explainYiJi(
  bazi: BaziProfile,
  _fortune: DailyFortune,
  item: string,
  type: 'yi' | 'ji',
  userProfile?: UserProfile
): Promise<string> {
  const seed = userProfile
    ? `${buildDailySeed(userProfile, _fortune.date)}_${type}_${item}`
    : `${_fortune.date}_${type}_${item}`;
  const rand = createSeededRandom(seed);

  const favorableLabel = bazi.favorableElements[0] ? getElementLabel(bazi.favorableElements[0]) : '水';
  const templates: Record<string, string[]> = {
    yi: [
      `"${item}"与你的${favorableLabel}气相应。今日行此，如顺水行舟，不必用力，自有其势。且以平常心待之。`,
      `日主${bazi.dayMaster}今日与"${item}"之气相和。非是定则，乃顺势之机。心有此念，便是时候。`,
      `"${item}"可助今日气数趋于中和。不求圆满，但求安然；过程中的体察，便是所得。`
    ],
    ji: [
      `"${item}"今日恐耗你之气。非谓绝不可为，若不得不为，且留三分余地，莫要勉强。`,
      `今日${favorableLabel}气不合"${item}"。若此事在心，不妨缓行，或换一思路，待气足再图。`,
      `"${item}"与今日气数稍逆。若行之遇阻，不必忧心，此乃气之自调。歇一歇，另寻其法。`
    ]
  };

  const selected = templates[type];
  return selected[Math.floor(rand() * selected.length)];
}
