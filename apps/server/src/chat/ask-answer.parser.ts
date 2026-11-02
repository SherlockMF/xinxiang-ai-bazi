// 问心 AI 返回解析与兜底

import type { AskAnswer, AskAnswerSource, RiskLevel } from './ask.types';

const DEFAULT_SAFETY_NOTE = '内容仅作传统文化与自我观察参考，不构成现实决策建议。';

const FORBIDDEN_PATTERNS = [
  /一定/g, /必然/g, /必定/g, /逃不过/g, /必发财/g, /必分手/g, /必复合/g,
  /有灾/g, /血光/g, /克夫/g, /克妻/g, /命不好/g, /大凶/g, /大吉/g
];

export const SAFETY_FALLBACK_ANSWER: AskAnswer = {
  title: '这个问题需要回到现实中判断',
  observation: '你提出的问题涉及较强的现实决策，心象只能提供自我观察角度，不能替你判断结果。',
  innerState: '可以先区分：这是情绪上的不安，还是现实中已经出现了明确问题。',
  suggestions: [
    '先记录你已经掌握的事实',
    '不要只根据一时情绪做决定',
    '必要时向现实中的专业人士或可信任的人确认'
  ],
  closingVerse: '心可以照见方向，但路仍要一步一步走。',
  riskLevel: 'high',
  safetyNote: DEFAULT_SAFETY_NOTE,
  source: 'safety_fallback'
};

export const GENERAL_FALLBACK_ANSWER: AskAnswer = {
  title: '先把心安下来',
  observation: '此刻的问题未必需要立刻得到确定答案，先看清自己的感受会更重要。',
  innerState: '你可能正处在想要确认方向，但又担心走错一步的状态里。',
  suggestions: [
    '先写下你最在意的事实',
    '把情绪和现实问题分开',
    '今天先做一个轻量行动'
  ],
  closingVerse: '慢下来，不是停下，而是让心重新看见方向。',
  riskLevel: 'medium',
  safetyNote: DEFAULT_SAFETY_NOTE,
  source: 'fallback'
};

function truncate(text: string, maxLen: number): string {
  if (!text) return '';
  const t = text.trim();
  return t.length <= maxLen ? t : `${t.slice(0, maxLen)}…`;
}

function sanitizeForbidden(text: string): string {
  let result = text;
  for (const pattern of FORBIDDEN_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result.replace(/\s{2,}/g, ' ').trim();
}

/** 从 AI 原始文本中提取 JSON */
export function extractJsonFromText(raw: string): unknown | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  try {
    return JSON.parse(trimmed);
  } catch { /* continue */ }

  const codeBlock = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (codeBlock?.[1]) {
    try {
      return JSON.parse(codeBlock[1].trim());
    } catch { /* continue */ }
  }

  const braceStart = trimmed.indexOf('{');
  const braceEnd = trimmed.lastIndexOf('}');
  if (braceStart >= 0 && braceEnd > braceStart) {
    try {
      return JSON.parse(trimmed.slice(braceStart, braceEnd + 1));
    } catch { /* continue */ }
  }

  return null;
}

function normalizeSuggestions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .slice(0, 3)
    .map(s => truncate(sanitizeForbidden(s), 24));
}

function isValidRiskLevel(v: unknown): v is RiskLevel {
  return v === 'low' || v === 'medium' || v === 'high';
}

/** 解析并规范化 AskAnswer；失败时返回 fallback */
export function parseAskAnswer(
  raw: string,
  source: AskAnswerSource = 'ai',
  fallback: AskAnswer = GENERAL_FALLBACK_ANSWER
): AskAnswer {
  const parsed = extractJsonFromText(raw);
  if (!parsed || typeof parsed !== 'object') {
    return { ...fallback, source: source === 'ai' ? 'fallback' : source };
  }

  const obj = parsed as Record<string, unknown>;
  const title = truncate(sanitizeForbidden(String(obj.title || '')), 20);
  const observation = truncate(sanitizeForbidden(String(obj.observation || '')), 80);
  const innerState = truncate(sanitizeForbidden(String(obj.innerState || '')), 80);
  const suggestions = normalizeSuggestions(obj.suggestions);
  const closingVerse = truncate(sanitizeForbidden(String(obj.closingVerse || '')), 30);
  const riskLevel = isValidRiskLevel(obj.riskLevel) ? obj.riskLevel : 'low';
  const safetyNote = truncate(
    String(obj.safetyNote || DEFAULT_SAFETY_NOTE),
    80
  ) || DEFAULT_SAFETY_NOTE;

  if (!title || !observation || !innerState || suggestions.length === 0 || !closingVerse) {
    return { ...fallback, source: source === 'ai' ? 'fallback' : source };
  }

  return {
    title,
    observation,
    innerState,
    suggestions,
    closingVerse,
    riskLevel,
    safetyNote,
    source
  };
}

export function buildAnswerContent(answer: AskAnswer): string {
  return answer.title;
}
