// 每日心象内容安全过滤（前端本地生成）

import type { DailyFortune } from '../types/index.ts';

const FORBIDDEN_PHRASES = [
  '今日必发财',
  '今日会分手',
  '今日有灾',
  '今日必须投资',
  '今日适合表白且一定成功',
  '今日不宜出门否则出事',
  '今日命中注定遇贵人',
  '必定发财',
  '必定分手',
  '一定有灾',
  '必遇贵人',
  '血光之灾'
];

const REPLACEMENTS: Record<string, string> = {
  必发财: '宜守正',
  必分手: '宜静观',
  有灾: '宜谨慎',
  命中注定: '顺势而行'
};

export function sanitizeDailyXiangText(text: string): string {
  if (!text) return text;
  let result = text;
  for (const phrase of FORBIDDEN_PHRASES) {
    if (result.includes(phrase)) {
      result = result.replace(new RegExp(phrase, 'g'), '');
    }
  }
  for (const [bad, good] of Object.entries(REPLACEMENTS)) {
    result = result.replace(new RegExp(bad, 'g'), good);
  }
  return result.replace(/\s{2,}/g, ' ').trim() || text.slice(0, 80);
}

export function sanitizeFortuneTextFields(fortune: DailyFortune): DailyFortune {
  return {
    ...fortune,
    moodKeyword: sanitizeDailyXiangText(fortune.moodKeyword),
    summary: sanitizeDailyXiangText(fortune.summary),
    actionSuggestion: sanitizeDailyXiangText(fortune.actionSuggestion),
    cyberBlessing: sanitizeDailyXiangText(fortune.cyberBlessing),
    yi: fortune.yi.map(sanitizeDailyXiangText),
    ji: fortune.ji.map(sanitizeDailyXiangText)
  };
}
