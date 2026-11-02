// 每日心象内容安全过滤（轻量管控）

const FORBIDDEN_PHRASES = [
  '今日必发财', '今日会分手', '今日有灾', '今日必须投资',
  '今日适合表白且一定成功', '今日不宜出门否则出事', '今日命中注定遇贵人',
  '必定发财', '必定分手', '一定有灾', '必遇贵人', '血光之灾'
];

const REPLACEMENTS: Record<string, string> = {
  '必发财': '宜守正',
  '必分手': '宜静观',
  '有灾': '宜谨慎',
  '命中注定': '顺势而行'
};

/** 过滤绝对预测与恐吓表达 */
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

/** 批量清洗心象文本字段 */
export function sanitizeFortuneFields(fortune: Record<string, unknown>): Record<string, unknown> {
  const copy = { ...fortune };
  const textKeys = ['summary', 'moodKeyword', 'actionSuggestion', 'cyberBlessing'];
  for (const key of textKeys) {
    if (typeof copy[key] === 'string') {
      copy[key] = sanitizeDailyXiangText(copy[key] as string);
    }
  }
  if (Array.isArray(copy.yi)) {
    copy.yi = (copy.yi as string[]).map(s => sanitizeDailyXiangText(s));
  }
  if (Array.isArray(copy.ji)) {
    copy.ji = (copy.ji as string[]).map(s => sanitizeDailyXiangText(s));
  }
  return copy;
}
