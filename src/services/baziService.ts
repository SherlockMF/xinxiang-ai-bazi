// 八字计算服务 - baziService
// 基于专业命理规则的四柱八字计算
// 参考：skills/bazi/SKILL.md 及 references 目录

import type { UserProfile, BaziProfile, Pillar, HeavenlyStem, EarthlyBranch, FiveElementType } from '../types';

// ============== 基础常量表 ==============

// 天干（甲乙丙丁戊己庚辛壬癸）
const HEAVENLY_STEMS: HeavenlyStem[] = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支（子丑寅卯辰巳午未申酉戌亥）
const EARTHLY_BRANCHES: EarthlyBranch[] = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const STEM_TO_ELEMENT: Record<HeavenlyStem, FiveElementType> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

// 地支五行（本气）
const BRANCH_TO_ELEMENT: Record<EarthlyBranch, FiveElementType> = {
  '子': 'water', '丑': 'earth',
  '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '戌': 'earth', '亥': 'water'
};

// 地支藏干表（本气、中气、余气）
const BRANCH_HIDDEN_STEMS: Record<EarthlyBranch, { main: HeavenlyStem; middle?: HeavenlyStem; residual?: HeavenlyStem }> = {
  '子': { main: '癸' },
  '丑': { main: '己', middle: '癸', residual: '辛' },
  '寅': { main: '甲', middle: '丙', residual: '戊' },
  '卯': { main: '乙' },
  '辰': { main: '戊', middle: '乙', residual: '癸' },
  '巳': { main: '丙', middle: '庚', residual: '戊' },
  '午': { main: '丁', middle: '己' },
  '未': { main: '己', middle: '丁', residual: '乙' },
  '申': { main: '庚', middle: '壬', residual: '戊' },
  '酉': { main: '辛' },
  '戌': { main: '戊', middle: '辛', residual: '丁' },
  '亥': { main: '壬', middle: '甲' }
};

// 五行生克关系
const ELEMENT_GENERATES: Record<FiveElementType, FiveElementType> = {
  wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood'
};
const ELEMENT_DESTROYS: Record<FiveElementType, FiveElementType> = {
  wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood'
};

// 五行性格关键词
const ELEMENT_PERSONALITY: Record<FiveElementType, string[]> = {
  wood: ['创造力强', '仁慈', '正直', '进取', '有韧性', '富有同情心'],
  fire: ['热情', '表达力强', '乐观', '有感染力', '善于社交', '积极主动'],
  earth: ['稳重', '包容', '务实', '负责', '守信', '善于统筹'],
  metal: ['果断', '理性', '刚毅', '有原则', '追求完美', '善于决断'],
  water: ['智慧', '灵活', '深沉', '善于沟通', '洞察力强', '适应力强']
};

// 十神定义
type TenGod = '比肩' | '劫财' | '食神' | '伤官' | '偏财' | '正财' | '七杀' | '正官' | '偏印' | '正印';

// 日上起时表（五虎遁）
const HOUR_STEM_TABLE: Record<HeavenlyStem, HeavenlyStem[]> = {
  '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '戊': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '己': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '庚': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '辛': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '壬': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '癸': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁']
};

// 年上起月表（五虎遁月）
const MONTH_STEM_TABLE: Record<HeavenlyStem, HeavenlyStem[]> = {
  '甲': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '乙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丙': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '丁': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '戊': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '己': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '庚': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '辛': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '壬': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '癸': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己']
};

// ============== 计算函数 ==============

/**
 * 判断天干阴阳
 */
function isYangStem(stem: HeavenlyStem): boolean {
  return ['甲', '丙', '戊', '庚', '壬'].includes(stem);
}

/**
 * 判断天干五行
 */
function getStemElement(stem: HeavenlyStem): FiveElementType {
  return STEM_TO_ELEMENT[stem];
}

/**
 * 判断地支五行
 */
function getBranchElement(branch: EarthlyBranch): FiveElementType {
  return BRANCH_TO_ELEMENT[branch];
}

/**
 * 计算十神
 * 以日主（日干）为中心，根据其他天干与日主的五行生克关系及阴阳异同来确定
 */
function calculateTenGod(dayMaster: HeavenlyStem, otherStem: HeavenlyStem): TenGod {
  const dayElement = getStemElement(dayMaster);
  const otherElement = getStemElement(otherStem);
  const dayIsYang = isYangStem(dayMaster);
  const otherIsYang = isYangStem(otherStem);
  const sameYinYang = dayIsYang === otherIsYang;

  // 生我（印星）
  if (ELEMENT_GENERATES[otherElement] === dayElement) {
    return sameYinYang ? '偏印' : '正印';
  }
  // 我生（食伤）
  if (ELEMENT_GENERATES[dayElement] === otherElement) {
    return sameYinYang ? '食神' : '伤官';
  }
  // 克我（官杀）
  if (ELEMENT_DESTROYS[otherElement] === dayElement) {
    return sameYinYang ? '七杀' : '正官';
  }
  // 我克（财星）
  if (ELEMENT_DESTROYS[dayElement] === otherElement) {
    return sameYinYang ? '偏财' : '正财';
  }
  // 同我（比劫）
  if (dayElement === otherElement) {
    return sameYinYang ? '比肩' : '劫财';
  }
  
  return '比肩'; // 默认
}

/**
 * 计算年柱
 * 使用立春为年柱分界点
 * 简化版：以公历年份计算（近似）
 */
function calculateYearPillar(year: number, month: number, day: number): Pillar {
  // 简化计算：2月4日立春前用上一年
  let actualYear = year;
  if (month < 2 || (month === 2 && day < 4)) {
    actualYear = year - 1;
  }
  
  const offset = (actualYear - 4) % 60;
  const stemIndex = offset % 10;
  const branchIndex = offset % 12;
  
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIndex],
    earthlyBranch: EARTHLY_BRANCHES[branchIndex],
    fullPillar: `${HEAVENLY_STEMS[stemIndex]}${EARTHLY_BRANCHES[branchIndex]}`
  };
}

/**
 * 计算月柱
 * 使用节气分界，以年干推月干（五虎遁）
 */
function calculateMonthPillar(_year: number, month: number, day: number, yearPillar: Pillar): Pillar {
  // 节气月份对照（近似）
  // 立春(2/4)→寅月, 惊蛰(3/6)→卯月, 清明(4/5)→辰月...
  const solarMonthMap: { month: number; day: number; branchIndex: number }[] = [
    { month: 2, day: 4, branchIndex: 2 },   // 寅月
    { month: 3, day: 6, branchIndex: 3 },   // 卯月
    { month: 4, day: 5, branchIndex: 4 },   // 辰月
    { month: 5, day: 6, branchIndex: 5 },   // 巳月
    { month: 6, day: 6, branchIndex: 6 },   // 午月
    { month: 7, day: 7, branchIndex: 7 },   // 未月
    { month: 8, day: 8, branchIndex: 8 },   // 申月
    { month: 9, day: 8, branchIndex: 9 },   // 酉月
    { month: 10, day: 8, branchIndex: 10 }, // 戌月
    { month: 11, day: 7, branchIndex: 11 }, // 亥月
    { month: 12, day: 7, branchIndex: 0 },  // 子月
    { month: 1, day: 6, branchIndex: 1 }    // 丑月
  ];
  
  // 找到当前节气月份
  let branchIndex = 1; // 默认丑月（1月）
  for (const sm of solarMonthMap) {
    if (month >= sm.month || (month === sm.month && day >= sm.day)) {
      branchIndex = sm.branchIndex;
    }
  }
  
  // 根据年干推月干（五虎遁）
  const yearStem = yearPillar.heavenlyStem;
  const monthStem = MONTH_STEM_TABLE[yearStem][branchIndex];
  
  return {
    heavenlyStem: monthStem,
    earthlyBranch: EARTHLY_BRANCHES[branchIndex],
    fullPillar: `${monthStem}${EARTHLY_BRANCHES[branchIndex]}`
  };
}

/**
 * 计算日柱
 * 使用干支纪日法
 */
function calculateDayPillar(year: number, month: number, day: number): Pillar {
  // 简化算法：使用公式计算
  // G = 4C + [C/4] + 5y + [y/4] + [3*(M+1)/5] + d - 3
  // Z = 8C + [C/4] + 5y + [y/4] + [3*(M+1)/5] + d + 7 + i
  // 其中 C=世纪-1, y=年份后两位, M=月份, d=日期, i=0或6(奇偶月)
  
  const C = Math.floor(year / 100);
  const y = year % 100;
  const M = month;
  const d = day;
  const i = M % 2 === 0 ? 6 : 0;
  
  // 1月2月需特殊处理
  let adjustedM = M;
  let adjustedY = y;
  let adjustedC = C;
  if (M === 1 || M === 2) {
    adjustedM = M + 12;
    adjustedY = y - 1;
    if (adjustedY < 0) {
      adjustedY = 99;
      adjustedC = C - 1;
    }
  }
  
  const G = 4 * adjustedC + Math.floor(adjustedC / 4) + 5 * adjustedY + Math.floor(adjustedY / 4) + Math.floor(3 * (adjustedM + 1) / 5) + d - 3;
  const Z = 8 * adjustedC + Math.floor(adjustedC / 4) + 5 * adjustedY + Math.floor(adjustedY / 4) + Math.floor(3 * (adjustedM + 1) / 5) + d + 7 + i;
  
  const stemIndex = G % 10;
  const branchIndex = Z % 12;
  
  const stemIdx = stemIndex >= 0 ? stemIndex : stemIndex + 10;
  const branchIdx = branchIndex >= 0 ? branchIndex : branchIndex + 12;
  
  return {
    heavenlyStem: HEAVENLY_STEMS[stemIdx],
    earthlyBranch: EARTHLY_BRANCHES[branchIdx],
    fullPillar: `${HEAVENLY_STEMS[stemIdx]}${EARTHLY_BRANCHES[branchIdx]}`
  };
}

/**
 * 计算时柱
 * 使用日上起时法（五鼠遁）
 */
function calculateHourPillar(dayPillar: Pillar, hour: number): Pillar {
  // 时辰对照表（23:00-1:00为子时）
  // 时辰索引：子0(23-1), 丑1(1-3), 寅2(3-5), 卯3(5-7), 辰4(7-9), 巳5(9-11),
  //          午6(11-13), 未7(13-15), 申8(15-17), 酉9(17-19), 戌10(19-21), 亥11(21-23)
  
  let branchIndex = 0;
  if (hour >= 23 || hour < 1) branchIndex = 0;      // 子时
  else if (hour >= 1 && hour < 3) branchIndex = 1;  // 丑时
  else if (hour >= 3 && hour < 5) branchIndex = 2;  // 寅时
  else if (hour >= 5 && hour < 7) branchIndex = 3;  // 卯时
  else if (hour >= 7 && hour < 9) branchIndex = 4;  // 辰时
  else if (hour >= 9 && hour < 11) branchIndex = 5; // 巳时
  else if (hour >= 11 && hour < 13) branchIndex = 6; // 午时
  else if (hour >= 13 && hour < 15) branchIndex = 7; // 未时
  else if (hour >= 15 && hour < 17) branchIndex = 8; // 申时
  else if (hour >= 17 && hour < 19) branchIndex = 9; // 酉时
  else if (hour >= 19 && hour < 21) branchIndex = 10; // 戌时
  else if (hour >= 21 && hour < 23) branchIndex = 11; // 亥时
  
  // 根据日干推时干（五鼠遁）
  const dayStem = dayPillar.heavenlyStem;
  const hourStem = HOUR_STEM_TABLE[dayStem][branchIndex];
  
  return {
    heavenlyStem: hourStem,
    earthlyBranch: EARTHLY_BRANCHES[branchIndex],
    fullPillar: `${hourStem}${EARTHLY_BRANCHES[branchIndex]}`
  };
}

/**
 * 计算五行能量分布
 */
function calculateFiveElements(
  yearPillar: Pillar,
  monthPillar: Pillar,
  dayPillar: Pillar,
  hourPillar: Pillar
): Record<FiveElementType, number> {
  const elements: Record<FiveElementType, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0
  };
  
  // 统计四柱天干五行
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach(pillar => {
    elements[getStemElement(pillar.heavenlyStem)] += 25;
  });
  
  // 统计四柱地支本气五行
  [yearPillar, monthPillar, dayPillar, hourPillar].forEach(pillar => {
    elements[getBranchElement(pillar.earthlyBranch)] += 15;
    
    // 藏干加权（本气60%，中气30%，余气10%）
    const hidden = BRANCH_HIDDEN_STEMS[pillar.earthlyBranch];
    if (hidden.main) elements[getStemElement(hidden.main)] += 9; // 15 * 0.6
    if (hidden.middle) elements[getStemElement(hidden.middle)] += 4.5; // 15 * 0.3
    if (hidden.residual) elements[getStemElement(hidden.residual)] += 1.5; // 15 * 0.1
  });
  
  // 转换为百分比（最大100）
  const total = Object.values(elements).reduce((a, b) => a + b, 0);
  Object.keys(elements).forEach(key => {
    elements[key as FiveElementType] = Math.round((elements[key as FiveElementType] / total) * 100);
  });
  
  return elements;
}

/**
 * 判断日主旺衰
 */
function analyzeDayMasterStrength(
  dayMaster: HeavenlyStem,
  monthBranch: EarthlyBranch,
  _otherBranches: EarthlyBranch[]
): { strength: '旺' | '相' | '休' | '囚' | '死'; description: string } {
  const dayElement = getStemElement(dayMaster);
  const monthElement = getBranchElement(monthBranch);
  
  // 五行旺相休囚死表（以月令为主）
  // 同我者旺，我生者相，生我者休，我克者囚，克我者死
  if (dayElement === monthElement) {
    return { strength: '旺', description: '日主得令，气势旺盛' };
  }
  if (ELEMENT_GENERATES[dayElement] === monthElement) {
    return { strength: '相', description: '日主之子当令，气势次旺' };
  }
  if (ELEMENT_GENERATES[monthElement] === dayElement) {
    return { strength: '休', description: '日主之母当令，气势休养' };
  }
  if (ELEMENT_DESTROYS[dayElement] === monthElement) {
    return { strength: '囚', description: '日主所克当令，气势受困' };
  }
  if (ELEMENT_DESTROYS[monthElement] === dayElement) {
    return { strength: '死', description: '克日主者当令，气势最弱' };
  }
  
  return { strength: '旺', description: '无法判断' };
}

/**
 * 取用神（简化版）
 */
function determineFavorableElements(
  dayMaster: HeavenlyStem,
  _fiveElements: Record<FiveElementType, number>,
  dayMasterStrength: '旺' | '相' | '休' | '囚' | '死'
): FiveElementType[] {
  const dayElement = getStemElement(dayMaster);
  
  // 身旺则抑，身弱则扶
  if (dayMasterStrength === '旺' || dayMasterStrength === '相') {
    // 身旺喜克泄耗
    return [
      ELEMENT_DESTROYS[dayElement], // 克我者
      ELEMENT_GENERATES[dayElement], // 我生者
      ELEMENT_DESTROYS[ELEMENT_GENERATES[dayElement]] // 我克者
    ];
  } else {
    // 身弱喜生扶
    return [
      ELEMENT_GENERATES[ELEMENT_DESTROYS[dayElement]], // 生我者
      dayElement // 同我者
    ];
  }
}

/**
 * 生成性格标签
 */
function generatePersonalityTags(
  dayMaster: HeavenlyStem,
  fiveElements: Record<FiveElementType, number>
): string[] {
  const dayElement = getStemElement(dayMaster);
  const tags: string[] = [];
  
  // 日主五行性格
  tags.push(...ELEMENT_PERSONALITY[dayElement].slice(0, 2));
  
  // 强势五行性格
  const sortedElements = Object.entries(fiveElements)
    .sort((a, b) => b[1] - a[1]) as [FiveElementType, number][];
  
  if (sortedElements[0][0] !== dayElement && sortedElements[0][1] > 25) {
    tags.push(...ELEMENT_PERSONALITY[sortedElements[0][0]].slice(0, 1));
  }
  
  return tags.slice(0, 5);
}

/**
 * 生成命盘摘要
 */
function generateBaziSummary(
  dayMaster: HeavenlyStem,
  pillars: { year: Pillar; month: Pillar; day: Pillar; hour: Pillar },
  dayMasterStrength: { strength: string; description: string },
  favorableElements: FiveElementType[]
): string {
  const dayElement = getStemElement(dayMaster);
  const favorableNames = favorableElements.map(e => {
    const names: Record<FiveElementType, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    };
    return names[e];
  }).join('、');
  
  const elementNames: Record<FiveElementType, string> = {
    wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
  };
  
  return `你是一位${dayMaster}日主，五行属${elementNames[dayElement]}。${dayMasterStrength.description}。你的命盘喜用${favorableNames}，在生活中多接触这些元素有助于提升运势。四柱配置为：年柱${pillars.year.heavenlyStem}${pillars.year.earthlyBranch}、月柱${pillars.month.heavenlyStem}${pillars.month.earthlyBranch}、日柱${pillars.day.heavenlyStem}${pillars.day.earthlyBranch}、时柱${pillars.hour.heavenlyStem}${pillars.hour.earthlyBranch}。`;
}

/**
 * 生成八字档案（主函数）
 */
export async function generateBaziProfile(userProfile: UserProfile): Promise<BaziProfile> {
  // 解析出生日期和时间
  const [year, month, day] = userProfile.birthDate.split('-').map(Number);
  const [hour, minute] = userProfile.birthTime.split(':').map(Number);
  
  console.log('[baziService] 生成八字档案:', { year, month, day, hour, minute });
  
  // 计算四柱
  const yearPillar = calculateYearPillar(year, month, day);
  const monthPillar = calculateMonthPillar(year, month, day, yearPillar);
  const dayPillar = calculateDayPillar(year, month, day);
  const hourPillar = calculateHourPillar(dayPillar, hour);
  
  console.log('[baziService] 四柱计算结果:', {
    yearPillar: `${yearPillar.heavenlyStem}${yearPillar.earthlyBranch}`,
    monthPillar: `${monthPillar.heavenlyStem}${monthPillar.earthlyBranch}`,
    dayPillar: `${dayPillar.heavenlyStem}${dayPillar.earthlyBranch}`,
    hourPillar: `${hourPillar.heavenlyStem}${hourPillar.earthlyBranch}`
  });
  
  // 日主（日干）
  const dayMaster = dayPillar.heavenlyStem;
  
  // 计算五行能量
  const fiveElements = calculateFiveElements(yearPillar, monthPillar, dayPillar, hourPillar);
  
  // 分析日主旺衰
  const dayMasterStrength = analyzeDayMasterStrength(dayMaster, monthPillar.earthlyBranch, [
    yearPillar.earthlyBranch, dayPillar.earthlyBranch, hourPillar.earthlyBranch
  ]);
  
  // 取用神
  const favorableElements = determineFavorableElements(dayMaster, fiveElements, dayMasterStrength.strength);
  
  // 生成性格标签
  const personalityTags = generatePersonalityTags(dayMaster, fiveElements);
  
  // 生成命盘摘要
  const summary = generateBaziSummary(dayMaster, {
    year: yearPillar, month: monthPillar, day: dayPillar, hour: hourPillar
  }, dayMasterStrength, favorableElements);
  
  const baziProfile: BaziProfile = {
    id: `bazi_${Date.now()}`,
    userId: userProfile.id,
    yearPillar: `${yearPillar.heavenlyStem}${yearPillar.earthlyBranch}`,
    monthPillar: `${monthPillar.heavenlyStem}${monthPillar.earthlyBranch}`,
    dayPillar: `${dayPillar.heavenlyStem}${dayPillar.earthlyBranch}`,
    hourPillar: `${hourPillar.heavenlyStem}${hourPillar.earthlyBranch}`,
    dayMaster,
    fiveElements: {
      wood: fiveElements.wood,
      fire: fiveElements.fire,
      earth: fiveElements.earth,
      metal: fiveElements.metal,
      water: fiveElements.water
    },
    favorableElements: favorableElements.map(e => {
      const names: Record<FiveElementType, string> = {
        wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
      };
      return names[e];
    }),
    personalityTags,
    summary,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('[baziService] 八字档案生成完成:', baziProfile);
  
  return baziProfile;
}

// 导出辅助函数供其他服务使用
export {
  HEAVENLY_STEMS,
  EARTHLY_BRANCHES,
  STEM_TO_ELEMENT,
  BRANCH_TO_ELEMENT,
  BRANCH_HIDDEN_STEMS,
  calculateTenGod,
  getStemElement,
  getBranchElement,
  ELEMENT_PERSONALITY
};