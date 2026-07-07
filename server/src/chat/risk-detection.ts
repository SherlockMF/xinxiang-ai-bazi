// 问心敏感问题识别

import type { RiskLevel } from './ask.types';

export interface QuestionRiskResult {
  riskLevel: RiskLevel;
  reason?: string;
  matchedKeywords?: string[];
}

type Rule = { level: RiskLevel; category: string; keywords: string[] };

const RISK_RULES: Rule[] = [
  {
    level: 'high',
    category: 'medical',
    keywords: [
      '生病', '癌', '抑郁', '自杀', '轻生', '吃药', '治疗', '医院', '手术',
      '怀孕', '流产', '疾病', '诊断', '精神病', '焦虑症', '双相', '得病', '有病'
    ]
  },
  {
    level: 'high',
    category: 'legal',
    keywords: [
      '起诉', '离婚官司', '合同纠纷', '违法', '犯罪', '判刑', '报警',
      '赔偿', '律师', '法院', '坐牢', '拘留', '诉讼'
    ]
  },
  {
    level: 'high',
    category: 'investment',
    keywords: [
      '股票', '基金', '加密货币', '比特币', '以太坊', '币', '买房', '卖房',
      '投资', '梭哈', '借钱', '贷款', '赌博', '彩票', '期货', '炒股', '理财', '发财'
    ]
  },
  {
    level: 'high',
    category: 'scare',
    keywords: [
      '是不是有灾', '会不会死', '血光', '破财', '克夫', '克妻', '克父母',
      '命不好', '活不久', '牢狱', '大凶', '灾祸', '凶兆', '必死'
    ]
  },
  {
    level: 'high',
    category: 'fortune_trade',
    keywords: [
      '买什么转运', '怎么改命', '开光', '消灾', '化煞', '转运物', '供奉',
      '法事', '护身符', '改运', '转运', '请神', '做法'
    ]
  },
  {
    level: 'high',
    category: 'relationship_control',
    keywords: [
      '怎么控制他', '怎么控制她', '怎么让对方离不开我', '怎么让他离不开我', '怎么让她离不开我',
      '怎么让他复合', '怎么让她复合', '操控', '小三', '离不开我'
    ]
  },
  {
    level: 'medium',
    category: 'relationship',
    keywords: [
      '他一定爱我吗', '他会不会回来', '她会不会回来', '我要不要分手',
      '我要不要离婚', '怎么让他', '怎么让她', '正缘', '出轨', '复合',
      '他是不是我的正缘', '会不会分手', '会不会结婚'
    ]
  }
];

export function detectQuestionRisk(question: string): QuestionRiskResult {
  const text = question.trim();
  const matchedKeywords: string[] = [];
  let highest: RiskLevel = 'low';
  let reason: string | undefined;

  for (const rule of RISK_RULES) {
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matchedKeywords.push(kw);
        if (rule.level === 'high') {
          highest = 'high';
          reason = rule.category;
        } else if (rule.level === 'medium' && highest !== 'high') {
          highest = 'medium';
          reason = rule.category;
        }
      }
    }
  }

  return {
    riskLevel: highest,
    reason,
    matchedKeywords: matchedKeywords.length > 0 ? [...new Set(matchedKeywords)] : undefined
  };
}
