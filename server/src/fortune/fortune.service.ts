// 运势生成服务 - NestJS 后端
import { Injectable } from '@nestjs/common';

interface BaziInput {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  dayMaster: string;
  fiveElements: Record<string, number>;
  favorableElements: string[];
  personalityTags: string[];
}

interface FortuneResult {
  overallScore: number;
  moodKeyword: string;
  summary: string;
  yi: string[];
  ji: string[];
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  actionSuggestion: string;
  cyberBlessing: string;
}

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

const LUCKY_COLORS: Record<string, string[]> = {
  wood: ['绿色', '青色', '翠绿', '薄荷绿'],
  fire: ['红色', '紫色', '橙色', '玫红'],
  earth: ['黄色', '棕色', '米色', '咖啡色'],
  metal: ['白色', '银色', '金色', '浅灰'],
  water: ['蓝色', '黑色', '深蓝', '墨绿']
};

const LUCKY_DIRECTIONS: Record<string, string[]> = {
  wood: ['东方', '东南方'],
  fire: ['南方'],
  earth: ['中央', '东北方', '西南方'],
  metal: ['西方', '西北方'],
  water: ['北方']
};

const MOOD_KEYWORDS = [
  '静谧流动', '温暖涌动', '稳重安和', '清晰锐利', '深沉洞察',
  '灵感迸发', '情绪波动', '平和自在', '能量收敛', '灵动舒展'
];

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

const ACTION_SUGGESTIONS = [
  '早晨醒来后，花3分钟感受今日的能量状态',
  '在重要决策前，先让情绪沉淀一下',
  '与他人交流时，保持温和的边界感',
  '完成一件事后，给自己一个小小的庆祝仪式',
  '睡前回顾今日的心流时刻，写下3个收获',
  '遇到不确定时，信任直觉的微妙信号',
  '安排一段独处时间，让思绪自然流动',
  '尝试用新的角度看待熟悉的日常'
];

@Injectable()
export class FortuneService {
  /**
   * 生成今日宜
   */
  private generateYi(favorableElements: string[]): string[] {
    const yi: string[] = [];
    favorableElements.forEach(element => {
      const tendency = ELEMENT_FORTUNE_TENDENCY[element];
      if (tendency) {
        const shuffled = [...tendency.positive].sort(() => Math.random() - 0.5);
        yi.push(...shuffled.slice(0, 2));
      }
    });
    yi.push('保持正念', '顺应流');
    return yi.slice(0, 5);
  }

  /**
   * 生成今日忌
   */
  private generateJi(favorableElements: string[]): string[] {
    const ji: string[] = [];
    const elementsOrder = ['wood', 'fire', 'earth', 'metal', 'water'];
    const unfavorable = elementsOrder.filter(e => !favorableElements.includes(e)).slice(0, 2);
    unfavorable.forEach(element => {
      const tendency = ELEMENT_FORTUNE_TENDENCY[element];
      if (tendency) {
        const shuffled = [...tendency.negative].sort(() => Math.random() - 0.5);
        ji.push(...shuffled.slice(0, 1));
      }
    });
    ji.push('情绪内耗');
    return ji.slice(0, 3);
  }

  /**
   * 生成幸运色
   */
  private generateLuckyColor(favorableElements: string[]): string {
    const element = favorableElements[0] || 'water';
    const colors = LUCKY_COLORS[element] || LUCKY_COLORS.water;
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 生成幸运数字
   */
  private generateLuckyNumber(favorableElements: string[]): number {
    const elementNumbers: Record<string, number[]> = {
      wood: [3, 8],
      fire: [2, 7],
      earth: [5, 6],
      metal: [4, 9],
      water: [1, 6]
    };
    const element = favorableElements[0] || 'water';
    const numbers = elementNumbers[element] || [1, 6];
    return numbers[Math.floor(Math.random() * numbers.length)];
  }

  /**
   * 生成幸运方向
   */
  private generateLuckyDirection(favorableElements: string[]): string {
    const element = favorableElements[0] || 'water';
    const directions = LUCKY_DIRECTIONS[element] || LUCKY_DIRECTIONS.water;
    return directions[Math.floor(Math.random() * directions.length)];
  }

  /**
   * 生成情绪关键词
   */
  private generateMoodKeyword(): string {
    return MOOD_KEYWORDS[Math.floor(Math.random() * MOOD_KEYWORDS.length)];
  }

  /**
   * 生成综合分数
   */
  private generateOverallScore(fiveElements: Record<string, number>): number {
    const elements = Object.values(fiveElements);
    const maxDiff = Math.max(...elements) - Math.min(...elements);
    const baseScore = 75 - maxDiff;
    const randomOffset = Math.floor(Math.random() * 10) - 5;
    return Math.max(60, Math.min(90, baseScore + randomOffset));
  }

  /**
   * 生成运势摘要
   */
  private generateSummary(bazi: BaziInput, score: number): string {
    const elementNames: Record<string, string> = {
      wood: '木', fire: '火', earth: '土', metal: '金', water: '水'
    };
    const element = bazi.favorableElements[0] || 'water';
    let trendDesc = score >= 80 ? '今日能量流动顺畅，适合发挥你的特质' :
                    score >= 70 ? '今日整体平稳，保持觉知即可' :
                    '今日能量有波动，建议多关注内心';
    return `你的${elementNames[element]}气今日${score >= 75 ? '升腾' : '收敛'}。${trendDesc}。${bazi.personalityTags[0]}的你，今天适合${bazi.favorableElements.includes('water') ? '静心思考' : '积极表达'}。`;
  }

  /**
   * 生成行动建议
   */
  private generateActionSuggestion(favorableElements: string[]): string {
    const element = favorableElements[0] || 'water';
    const index = ['wood', 'fire', 'earth', 'metal', 'water'].indexOf(element);
    return ACTION_SUGGESTIONS[index] || ACTION_SUGGESTIONS[0];
  }

  /**
   * 生成赛博祝福语
   */
  private generateCyberBlessing(score: number): string {
    const pool = score >= 80 ? CYBER_BLESSINGS_HIGH :
                 score >= 70 ? CYBER_BLESSINGS_MEDIUM :
                 CYBER_BLESSINGS_LOW;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  /**
   * 生成每日运势
   */
  generateFortune(bazi: BaziInput, date: string): FortuneResult {
    const score = this.generateOverallScore(bazi.fiveElements);
    return {
      overallScore: score,
      moodKeyword: this.generateMoodKeyword(),
      summary: this.generateSummary(bazi, score),
      yi: this.generateYi(bazi.favorableElements),
      ji: this.generateJi(bazi.favorableElements),
      luckyColor: this.generateLuckyColor(bazi.favorableElements),
      luckyNumber: this.generateLuckyNumber(bazi.favorableElements),
      luckyDirection: this.generateLuckyDirection(bazi.favorableElements),
      actionSuggestion: this.generateActionSuggestion(bazi.favorableElements),
      cyberBlessing: this.generateCyberBlessing(score)
    };
  }
}