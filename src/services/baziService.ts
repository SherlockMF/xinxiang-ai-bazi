// 八字计算服务 - baziService
// 计算用户八字档案，包含四柱、五行能量、性格标签等

import type { UserProfile, BaziProfile, Pillar, HeavenlyStem, EarthlyBranch, FiveElementType } from '../types';

// 天干
const HEAVENLY_STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const EARTHLY_BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const STEM_TO_ELEMENT: Record<HeavenlyStem, FiveElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

// 地支五行
const BRANCH_TO_ELEMENT: Record<EarthlyBranch, FiveElementType> = {
  '子': 'water', '丑': 'earth',
  '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '戌': 'earth', '亥': 'water'
};

// 五行性格关键词
const ELEMENT_PERSONALITY: Record<FiveElementType, string[]> = {
  wood: ['创造力强', '仁慈', '正直', '进取', '有韧性'],
  fire: ['热情', '表达力强', '乐观', '有感染力', '冲动'],
  earth: ['稳重', '包容', '务实', '负责', '守信'],
  metal: ['果断', '理性', '刚毅', '有原则', '追求完美'],
  water: ['智慧', '灵活', '深沉', '善于沟通', '洞察力强']
};

/**
 * 计算年柱
 * 年柱 = (年份 - 4) % 60
 */
function calculateYearPillar(year: number): Pillar {
  const offset = (year - 4) % 60;
  const stemIndex = offset % 10;
  const branchIndex = offset % 12;
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    fullPillar: `${stem}${branch}`
  };
}

/**
 * 计算月柱（简化版，基于年干和月份）
 * 实际计算需要考虑节气，这里简化处理
 */
function calculateMonthPillar(_year: number, month: number, yearStem: HeavenlyStem): Pillar {
  // 月支（农历月份对应）
  const branchIndex = (month + 1) % 12;
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  // 月干根据年干推算
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const stemBase = (yearStemIndex % 5) * 2;
  const stemIndex = (stemBase + month - 1) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    fullPillar: `${stem}${branch}`
  };
}

/**
 * 计算日柱（简化版）
 * 真实计算需要考虑节气和月数，这里用简化算法
 */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 简化计算：基于日期累计
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const stemIndex = (daysDiff + 10) % 10;
  const branchIndex = (daysDiff + 12) % 12;
  
  const stem = HEAVENLY_STEMS[stemIndex];
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    fullPillar: `${stem}${branch}`
  };
}

/**
 * 计算时柱
 * 时柱 = 日干 + 时辰
 */
function calculateHourPillar(dayStem: HeavenlyStem, hour: number): Pillar {
  // 时辰对应
  const branchIndex = Math.floor((hour + 1) / 2) % 12;
  const branch = EARTHLY_BRANCHES[branchIndex];
  
  // 时干根据日干推算
  const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
  const stemBase = (dayStemIndex % 5) * 2;
  const stemIndex = (stemBase + Math.floor(hour / 2)) % 10;
  const stem = HEAVENLY_STEMS[stemIndex];
  
  return {
    heavenlyStem: stem,
    earthlyBranch: branch,
    fullPillar: `${stem}${branch}`
  };
}

/**
 * 计算五行能量分布
 */
function calculateFiveElementsEnergy(pillars: Pillar[]): Record<FiveElementType, number> {
  const elements: Record<FiveElementType, number> = {
    wood: 0,
    fire: 0,
    earth: 0,
    metal: 0,
    water: 0
  };
  
  // 统计每个天干和地支的五行
  pillars.forEach(pillar => {
    const stemElement = STEM_TO_ELEMENT[pillar.heavenlyStem];
    const branchElement = BRANCH_TO_ELEMENT[pillar.earthlyBranch];
    elements[stemElement] += 2; // 天干权重更高
    elements[branchElement] += 1;
  });
  
  // 转换为百分比
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  const result: Record<FiveElementType, number> = {
    wood: Math.round((elements.wood / total) * 100),
    fire: Math.round((elements.fire / total) * 100),
    earth: Math.round((elements.earth / total) * 100),
    metal: Math.round((elements.metal / total) * 100),
    water: Math.round((elements.water / total) * 100)
  };
  
  return result;
}

/**
 * 推算喜用五行
 * 基于日主五行强弱，推算需要的五行
 */
function calculateFavorableElements(dayMaster: HeavenlyStem, fiveElements: Record<FiveElementType, number>): string[] {
  const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
  const energy = fiveElements[dayMasterElement];
  
  // 如果日主能量强，需要泄耗；如果弱，需要帮扶
  if (energy > 25) {
    // 强则泄耗：找能泄日主的五行
    // 木→火→土→金→水→木（相生顺序）
    const elements: FiveElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    const currentIndex = elements.indexOf(dayMasterElement);
    const releaseElement = elements[(currentIndex + 1) % 5]; // 被日主所生
    const consumeElement = elements[(currentIndex + 2) % 5]; // 克日主
    return [releaseElement, consumeElement];
  } else {
    // 弱则帮扶：找能帮日主的五行
    const elements: FiveElementType[] = ['wood', 'fire', 'earth', 'metal', 'water'];
    const currentIndex = elements.indexOf(dayMasterElement);
    const sameElement = dayMasterElement; // 同五行
    const supportElement = elements[(currentIndex - 1 + 5) % 5]; // 生日主
    return [sameElement, supportElement];
  }
}

/**
 * 生成性格标签
 * 基于五行能量和日主
 */
function generatePersonalityTags(dayMaster: HeavenlyStem, fiveElements: Record<FiveElementType, number>): string[] {
  const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
  const baseTags = ELEMENT_PERSONALITY[dayMasterElement];
  
  // 找能量最高的五行补充性格
  const sortedElements = Object.entries(fiveElements)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([element]) => element as FiveElementType);
  
  const additionalTags: string[] = [];
  sortedElements.forEach(element => {
    if (element !== dayMasterElement) {
      additionalTags.push(ELEMENT_PERSONALITY[element][0]);
    }
  });
  
  return [...baseTags.slice(0, 3), ...additionalTags];
}

/**
 * 生成命盘摘要
 */
function generateSummary(dayMaster: HeavenlyStem, fiveElements: Record<FiveElementType, number>, personalityTags: string[]): string {
  const elementNames: Record<FiveElementType, string> = {
    wood: '木',
    fire: '火',
    earth: '土',
    metal: '金',
    water: '水'
  };
  
  const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
  const energy = fiveElements[dayMasterElement];
  
  let energyDesc = '';
  if (energy > 30) {
    energyDesc = '能量充沛';
  } else if (energy > 20) {
    energyDesc = '能量平衡';
  } else {
    energyDesc = '能量偏弱';
  }
  
  const topElement = Object.entries(fiveElements)
    .sort((a, b) => b[1] - a[1])[0][0] as FiveElementType;
  
  return `你的日主为${dayMaster}，属${elementNames[dayMasterElement]}，${energyDesc}。命盘中${elementNames[topElement]}气最旺，赋予你"${personalityTags[0]}"的特质。整体命盘呈现"${personalityTags.slice(0, 2).join('、')}"的性格倾向。`;
}

/**
 * 生成八字档案
 * 主入口函数
 */
export async function generateBaziProfile(user: UserProfile): Promise<BaziProfile> {
  const birthDate = new Date(user.birthDate);
  const year = birthDate.getFullYear();
  const month = birthDate.getMonth() + 1;
  const day = birthDate.getDate();
  
  const [hourStr] = user.birthTime.split(':');
  const hour = parseInt(hourStr, 10);
  
  // 计算四柱
  const yearPillar = calculateYearPillar(year);
  const monthPillar = calculateMonthPillar(year, month, yearPillar.heavenlyStem);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar.heavenlyStem, hour);
  
  // 日主（日干）
  const dayMaster = dayPillar.heavenlyStem;
  
  // 五行能量
  const fiveElements = calculateFiveElementsEnergy([
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar
  ]);
  
  // 喜用五行
  const favorableElements = calculateFavorableElements(dayMaster, fiveElements);
  
  // 性格标签
  const personalityTags = generatePersonalityTags(dayMaster, fiveElements);
  
  // 命盘摘要
  const summary = generateSummary(dayMaster, fiveElements, personalityTags);
  
  const now = new Date().toISOString();
  
  return {
    id: `bazi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId: user.id,
    yearPillar: yearPillar.fullPillar,
    monthPillar: monthPillar.fullPillar,
    dayPillar: dayPillar.fullPillar,
    hourPillar: hourPillar.fullPillar,
    dayMaster,
    fiveElements,
    favorableElements,
    personalityTags,
    summary,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * 导出辅助函数供其他服务使用
 */
export {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  BRANCH_TO_ELEMENT,
  ELEMENT_PERSONALITY
};