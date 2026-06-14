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
   * 计算年柱
   */
  private calculateYearPillar(year: number): Pillar {
    const offset = (year - 4) % 60;
    const stemIndex = offset % 10;
    const branchIndex = offset % 12;
    const stem = HEAVENLY_STEMS[stemIndex];
    const branch = EARTHLY_BRANCHES[branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算月柱
   */
  private calculateMonthPillar(year: number, month: number, yearStem: string): Pillar {
    const branchIndex = (month + 1) % 12;
    const branch = EARTHLY_BRANCHES[branchIndex];
    const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
    const stemBase = (yearStemIndex % 5) * 2;
    const stemIndex = (stemBase + month - 1) % 10;
    const stem = HEAVENLY_STEMS[stemIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算日柱
   */
  private calculateDayPillar(year: number, month: number, day: number): Pillar {
    const baseDate = new Date(1900, 0, 1);
    const targetDate = new Date(year, month - 1, day);
    const daysDiff = Math.floor((targetDate.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
    const stemIndex = (daysDiff + 10) % 10;
    const branchIndex = (daysDiff + 12) % 12;
    const stem = HEAVENLY_STEMS[stemIndex];
    const branch = EARTHLY_BRANCHES[branchIndex];
    return { heavenlyStem: stem, earthlyBranch: branch, fullPillar: `${stem}${branch}` };
  }

  /**
   * 计算时柱
   */
  private calculateHourPillar(dayStem: string, hour: number): Pillar {
    const branchIndex = Math.floor((hour + 1) / 2) % 12;
    const branch = EARTHLY_BRANCHES[branchIndex];
    const dayStemIndex = HEAVENLY_STEMS.indexOf(dayStem);
    const stemBase = (dayStemIndex % 5) * 2;
    const stemIndex = (stemBase + Math.floor(hour / 2)) % 10;
    const stem = HEAVENLY_STEMS[stemIndex];
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
    const baseTags = ELEMENT_PERSONALITY[dayMasterElement];
    const sortedElements = Object.entries(fiveElements)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([element]) => element);
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
  private generateSummary(dayMaster: string, fiveElements: Record<string, number>, personalityTags: string[]): string {
    const elementNames: Record<string, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    };
    const dayMasterElement = STEM_TO_ELEMENT[dayMaster];
    const energy = fiveElements[dayMasterElement];
    let energyDesc = energy > 30 ? '能量充沛' : energy > 20 ? '能量平衡' : '能量偏弱';
    const topElement = Object.entries(fiveElements).sort((a, b) => b[1] - a[1])[0][0];
    return `你的日主为${dayMaster}，属${elementNames[dayMasterElement]}，${energyDesc}。命盘中${elementNames[topElement]}气最旺，赋予你"${personalityTags[0]}"的特质。整体命盘呈现"${personalityTags.slice(0, 2).join('、')}"的性格倾向。`;
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

    const yearPillar = this.calculateYearPillar(year);
    const monthPillar = this.calculateMonthPillar(year, month, yearPillar.heavenlyStem);
    const dayPillar = this.calculateDayPillar(year, month, day);
    const hourPillar = this.calculateHourPillar(dayPillar.heavenlyStem, hour);

    const dayMaster = dayPillar.heavenlyStem;
    const fiveElements = this.calculateFiveElementsEnergy([yearPillar, monthPillar, dayPillar, hourPillar]);
    const favorableElements = this.calculateFavorableElements(dayMaster, fiveElements);
    const personalityTags = this.generatePersonalityTags(dayMaster, fiveElements);
    const summary = this.generateSummary(dayMaster, fiveElements, personalityTags);

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