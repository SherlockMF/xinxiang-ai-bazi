// 八字生成服务 - NestJS 后端
import { Injectable } from '@nestjs/common';

// 天干
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 地支
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 天干五行
const STEM_TO_ELEMENT: Record<string, string> = {
  '甲': 'wood', '乙': 'wood',
  '丙': 'fire', '丁': 'fire',
  '戊': 'earth', '己': 'earth',
  '庚': 'metal', '辛': 'metal',
  '壬': 'water', '癸': 'water'
};

// 地支五行
const BRANCH_TO_ELEMENT: Record<string, string> = {
  '子': 'water', '丑': 'earth',
  '寅': 'wood', '卯': 'wood',
  '辰': 'earth', '巳': 'fire',
  '午': 'fire', '未': 'earth',
  '申': 'metal', '酉': 'metal',
  '戌': 'earth', '亥': 'water'
};

// 五行性格关键词
const ELEMENT_PERSONALITY: Record<string, string[]> = {
  wood: ['创造力强', '仁慈', '正直', '进取', '有韧性'],
  fire: ['热情', '表达力强', '乐观', '有感染力', '冲动'],
  earth: ['稳重', '包容', '务实', '负责', '守信'],
  metal: ['果断', '理性', '刚毅', '有原则', '追求完美'],
  water: ['智慧', '灵活', '深沉', '善于沟通', '洞察力强']
};

// 五虎遁月干表（按地支索引排列：子0到亥11）
const MONTH_STEM_TABLE: Record<string, string[]> = {
  '甲': ['丙', '丁', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '乙': ['戊', '己', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '丙': ['庚', '辛', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丁': ['壬', '癸', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '戊': ['甲', '乙', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '己': ['丙', '丁', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '庚': ['戊', '己', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '辛': ['庚', '辛', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '壬': ['壬', '癸', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '癸': ['甲', '乙', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
};

// 五鼠遁时干表（按地支索引排列：子0到亥11）
const HOUR_STEM_TABLE: Record<string, string[]> = {
  '甲': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '乙': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '丙': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '丁': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '戊': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'],
  '己': ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙'],
  '庚': ['丙', '丁', '戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁'],
  '辛': ['戊', '己', '庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己'],
  '壬': ['庚', '辛', '壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛'],
  '癸': ['壬', '癸', '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']
};

// 节气月份对照（简化版）
const SOLAR_MONTH_MAP = [
  { month: 12, day: 7, branchIndex: 0 },  // 子月（大雪）
  { month: 1, day: 6, branchIndex: 1 },    // 丑月（小寒）
  { month: 2, day: 4, branchIndex: 2 },    // 寅月（立春）
  { month: 3, day: 6, branchIndex: 3 },    // 卯月（惊蛰）
  { month: 4, day: 5, branchIndex: 4 },    // 辰月（清明）
  { month: 5, day: 6, branchIndex: 5 },    // 巳月（立夏）
  { month: 6, day: 6, branchIndex: 6 },    // 午月（芒种）
  { month: 7, day: 7, branchIndex: 7 },    // 未月（小暑）
  { month: 8, day: 8, branchIndex: 8 },    // 申月（立秋）
  { month: 9, day: 8, branchIndex: 9 },    // 酉月（白露）
  { month: 10, day: 8, branchIndex: 10 },  // 戌月（寒露）
  { month: 11, day: 7, branchIndex: 11 }   // 亥月（立冬）
];

interface Pillar {
  heavenlyStem: string;
  earthlyBranch: string;
  fullPillar: string;
}

interface BaziResult {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  fiveElements: Record<string, number>;
  favorableElements: string[];
  personalityTags: string[];
  summary: string;
}

@Injectable()
export class BaziService {
  /**
   * 计算年柱（考虑立春分界）
   */
  private calculateYearPillar(year: number, month: number, day: number): Pillar {
    // 立春前用上一年
    let actualYear = year;
    if (month < 2 || (month === 2 && day < 4)) {
      actualYear = year - 1;
    }
    
    const offset = (actualYear - 4) % 60;
    const stemIndex = offset % 10;
    const branchIndex = offset % 12;
    const stem = HEAVENLY_STEMS[stemIndex];
    const branch = EARTHLY_BRANCHES[branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算月柱（根据节气）
   */
  private calculateMonthPillar(year: number, month: number, day: number, yearStem: string): Pillar {
    // 确定月份地支（根据节气）
    let branchIndex = 1; // 默认丑月
    
    for (const sm of SOLAR_MONTH_MAP) {
      if (month > sm.month || (month === sm.month && day >= sm.day)) {
        branchIndex = sm.branchIndex;
      }
    }
    
    const branch = EARTHLY_BRANCHES[branchIndex];
    const stem = MONTH_STEM_TABLE[yearStem][branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算日柱（基准：1900年1月1日=甲戌日，序数10）
   */
  private calculateDayPillar(year: number, month: number, day: number): Pillar {
    // 使用 UTC 时间避免时区问题
    const baseDate = Date.UTC(1900, 0, 1);
    const targetDate = Date.UTC(year, month - 1, day);
    const daysDiff = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
    
    const BASE_INDEX = 10; // 甲戌的干支序数
    const ganZhiIndex = (daysDiff + BASE_INDEX) % 60;
    
    const stemIndex = ganZhiIndex % 10;
    const branchIndex = ganZhiIndex % 12;
    const stem = HEAVENLY_STEMS[stemIndex];
    const branch = EARTHLY_BRANCHES[branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算时柱（根据日干和时辰）
   */
  private calculateHourPillar(dayStem: string, hour: number): Pillar {
    // 时辰索引：子时(23-1)=0, 丑时(1-3)=1, 寅时(3-5)=2, 卯时(5-7)=3...
    let branchIndex: number;
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
    else branchIndex = 11; // 亥时
    
    const branch = EARTHLY_BRANCHES[branchIndex];
    const stem = HOUR_STEM_TABLE[dayStem][branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算五行能量
   */
  private calculateFiveElementsEnergy(pillars: Pillar[]): Record<string, number> {
    const elements: Record<string, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
    pillars.forEach(pillar => {
      const stemElement = STEM_TO_ELEMENT[pillar.heavenlyStem];
      const branchElement = BRANCH_TO_ELEMENT[pillar.earthlyBranch];
      elements[stemElement] += 2;
      elements[branchElement] += 1;
    });
    const total = Object.values(elements).reduce((a, b) => a + b, 0);
    const result: Record<string, number> = {};
    Object.entries(elements).forEach(([key, value]) => {
      result[key] = Math.round((value / total) * 100);
    });
    return result;
  }

  /**
   * 计算喜用五行
   */
  private calculateFavorableElements(dayMaster: string, fiveElements: Record<string, number>): string[] {
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
    const energy = fiveElements[dayMasterElement];
    const elementsOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
    const currentIndex = elementsOrder.indexOf(dayMasterElement);
    if (energy > 25) {
      return [
        elementsOrder[(currentIndex + 1) % 5],
        elementsOrder[(currentIndex + 2) % 5]
      ];
    } else {
      return [
        dayMasterElement,
        elementsOrder[(currentIndex - 1 + 5) % 5]
      ];
    }
  }

  /**
   * 生成性格标签
   */
  private generatePersonalityTags(dayMaster: string, fiveElements: Record<string, number>): string[] {
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
    const baseTags = ELEMENT_PERSONALITY[dayMasterElement] || [];
    const sortedElements = Object.entries(fiveElements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([element]) => element);
    const additionalTags: string[] = [];
    sortedElements.forEach(element => {
      if (element !== dayMasterElement) {
        const tags = ELEMENT_PERSONALITY[element] || [];
        additionalTags.push(tags[0]);
      }
    });
    return [...baseTags.slice(0, 3), ...additionalTags];
  }

  /**
   * 生成命盘摘要
   */
  private generateSummary(dayMaster: string, fiveElements: Record<string, number>, personalityTags: string[]): string {
    const elementNames: Record<string, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    };
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
    const energy = fiveElements[dayMasterElement] || 20;
    let energyDesc = energy > 30 ? '能量充沛' : energy > 20 ? '能量平衡' : '能量偏弱';
    const sorted = Object.entries(fiveElements).sort((a, b) => b[1] - a[1]);
    const topElement = sorted[0]?.[0] || 'water';
    return `你的日主为${dayMaster}，属${elementNames[dayMasterElement]}，${energyDesc}。命盘中${elementNames[topElement]}气最旺，赋予你"${personalityTags[0] || '智慧'}"的特质。整体命盘呈现"${personalityTags.slice(0, 2).join('、')}"的性格倾向。`;
  }

  /**
   * 生成八字档案
   */
  generateBazi(birthDate: string, birthTime: string): BaziResult {
    const date = new Date(birthDate);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = parseInt(birthTime.split(':')[0], 10);

    const yearPillar = this.calculateYearPillar(year, month, day);
    const monthPillar = this.calculateMonthPillar(year, month, day, yearPillar.heavenlyStem);
    const dayPillar = this.calculateDayPillar(year, month, day);
    const hourPillar = this.calculateHourPillar(dayPillar.heavenlyStem, hour);

    const dayMaster = dayPillar.heavenlyStem;
    const fiveElements = this.calculateFiveElementsEnergy([yearPillar, monthPillar, dayPillar, hourPillar]);
    const favorableElements = this.calculateFavorableElements(dayMaster, fiveElements);
    const personalityTags = this.generatePersonalityTags(dayMaster, fiveElements);
    const summary = this.generateSummary(dayMaster, fiveElements, personalityTags);

    console.log('[BaziService] 四柱计算结果:', {
      birthDate, birthTime, year, month, day, hour,
      yearPillar: yearPillar.fullPillar,
      monthPillar: monthPillar.fullPillar,
      dayPillar: dayPillar.fullPillar,
      hourPillar: hourPillar.fullPillar
    });

    return {
      yearPillar: yearPillar.fullPillar,
      monthPillar: monthPillar.fullPillar,
      dayPillar: dayPillar.fullPillar,
      hourPillar: hourPillar.fullPillar,
      dayMaster,
      fiveElements,
      favorableElements,
      personalityTags,
      summary
    };
  }
}