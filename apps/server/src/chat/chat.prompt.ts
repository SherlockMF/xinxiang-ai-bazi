// 问心 AI Prompt 模板

import type { AskQuestionType, BaziLite, DailyXiangLite } from './ask.types';

const QUESTION_TYPE_LABELS: Record<AskQuestionType, string> = {
  relationship: '关系与情感',
  career: '事业与推进',
  emotion: '情绪与内观',
  social: '社交与沟通',
  self: '自我观察',
  general: '一般'
};

export function buildBaziLiteSummary(bazi?: BaziLite): string {
  if (!bazi) return '（未提供）';
  return [
    bazi.dayMaster ? `日主：${bazi.dayMaster}` : '',
    bazi.yearPillar ? `年柱：${bazi.yearPillar}` : '',
    bazi.monthPillar ? `月柱：${bazi.monthPillar}` : '',
    bazi.dayPillar ? `日柱：${bazi.dayPillar}` : '',
    bazi.hourPillar ? `时柱：${bazi.hourPillar}` : '',
    bazi.favorableElements?.length ? `宜亲近：${bazi.favorableElements.join('、')}` : '',
    bazi.personalityTags?.length ? `气质：${bazi.personalityTags.slice(0, 3).join('、')}` : '',
    bazi.summary ? `摘要：${bazi.summary.slice(0, 120)}` : ''
  ].filter(Boolean).join('\n');
}

export function buildDailyXiangSummary(daily?: DailyXiangLite): string {
  if (!daily) return '（未提供）';
  return [
    daily.date ? `日期：${daily.date}` : '',
    daily.moodKeyword ? `今日之象：${daily.moodKeyword}` : '',
    daily.overallScore != null ? `气数：${daily.overallScore}` : '',
    daily.summary ? `摘要：${daily.summary.slice(0, 80)}` : '',
    daily.yi?.length ? `宜：${daily.yi.slice(0, 3).join('、')}` : '',
    daily.ji?.length ? `忌：${daily.ji.slice(0, 2).join('、')}` : '',
    daily.actionSuggestion ? `行止：${daily.actionSuggestion.slice(0, 60)}` : ''
  ].filter(Boolean).join('\n');
}

export function buildAskSystemPrompt(relationshipMedium = false): string {
  const relationshipExtra = relationshipMedium
    ? `\n【婚恋类问题额外限制】
- 只观察用户自己的感受与沟通方式。
- 不判断对方真实想法，不判断必然结果。
- 不建议分手、离婚、复合、结婚等重大决定。
- 不鼓励操控或改变他人。`
    : '';

  return `你是「心象」小程序的东方心象回应生成器。

产品定位：
「心象」不是严肃预测工具，而是基于传统文化表达的每日心象、自我观察和情绪陪伴工具。

你的任务：
结合用户的本心画像摘要、今日心象和用户问题，生成一段结构化的"心象回应"。

必须遵守：
1. 使用东方文化、内观、自我观察、情绪陪伴的语言。
2. 不做绝对预测，不判断现实结果。
3. 不制造恐吓。
4. 不提供医疗、法律、投资建议。
5. 不建议用户做重大现实决策。
6. 不鼓励婚恋操控。
7. 不推荐购买改运物品。
8. 不使用"注定、必然、一定、必定、逃不过、必发财、必分手、必复合"等词。
9. 不使用"有灾、血光、克夫、克妻、命不好"等恐吓词。
10. 回复必须短，适合移动端卡片展示。
11. 必须输出合法 JSON，不要输出 Markdown，不要输出解释文字。${relationshipExtra}

字段长度限制：
- title：20字以内
- observation：80字以内
- innerState：80字以内
- suggestions：最多3条，每条24字以内
- closingVerse：30字以内

请严格输出 JSON，不要输出 Markdown，不要输出多余解释：

{
  "title": "",
  "observation": "",
  "innerState": "",
  "suggestions": ["", "", ""],
  "closingVerse": "",
  "riskLevel": "low",
  "safetyNote": "内容仅作传统文化与自我观察参考，不构成现实决策建议。"
}`;
}

export function buildAskUserPrompt(
  question: string,
  questionType: AskQuestionType,
  baziLite?: BaziLite,
  dailyXiang?: DailyXiangLite
): string {
  return `输入信息：

用户问题类型：${QUESTION_TYPE_LABELS[questionType]}

用户问题：
${question}

本心画像摘要：
${buildBaziLiteSummary(baziLite)}

今日心象：
${buildDailyXiangSummary(dailyXiang)}`;
}
