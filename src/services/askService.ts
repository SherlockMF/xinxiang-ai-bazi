// 问心 AI 服务 - 请求构建、解析与本地兜底

import type {
  AskAnswer,
  AskQuestionType,
  AskRequest,
  BaziProfile,
  DailyFortune,
  UserProfile
} from '../types';
import { getElementLabel } from '../types';
import { Network } from '../network';
import { detectQuestionRisk, MAX_ASK_QUESTION_LENGTH } from './riskDetection';

const DEFAULT_SAFETY_NOTE = '内容仅作传统文化与自我观察参考，不构成现实决策建议。';

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

const QUICK_QUESTION_TYPE_MAP: Record<string, AskQuestionType> = {
  '今天适合主动联系对方吗？': 'social',
  '今天适合推进重要事情吗？': 'career',
  '我现在为什么有点不安？': 'emotion',
  '今天沟通要注意什么？': 'social'
};

export function inferQuestionType(question: string): AskQuestionType {
  if (QUICK_QUESTION_TYPE_MAP[question]) {
    return QUICK_QUESTION_TYPE_MAP[question];
  }
  const text = question;
  if (/他|她|对方|恋爱|感情|关系|分手|复合|结婚|离婚/.test(text)) return 'relationship';
  if (/工作|事业|项目|推进|面试|升职|老板/.test(text)) return 'career';
  if (/不安|焦虑|情绪|心情|害怕|担心|烦/.test(text)) return 'emotion';
  if (/沟通|联系|社交|朋友|说话/.test(text)) return 'social';
  if (/我|自己|内心/.test(text)) return 'self';
  return 'general';
}

export function buildAskRequest(
  userId: string,
  question: string,
  userProfile: UserProfile,
  bazi: BaziProfile,
  fortune: DailyFortune,
  history: Array<{ role: string; content: string }>
): AskRequest {
  return {
    userId,
    question: question.trim().slice(0, MAX_ASK_QUESTION_LENGTH),
    questionType: inferQuestionType(question),
    birthProfile: {
      calendarType: userProfile.calendarType,
      birthDate: userProfile.birthDate,
      timeBranch: userProfile.timeBranch,
      unknownTime: userProfile.unknownTime,
      gender: userProfile.gender
    },
    baziLite: {
      dayMaster: bazi.dayMaster,
      yearPillar: bazi.yearPillar,
      monthPillar: bazi.monthPillar,
      dayPillar: bazi.dayPillar,
      hourPillar: bazi.hourPillar,
      favorableElements: bazi.favorableElements.map(getElementLabel),
      personalityTags: bazi.personalityTags,
      summary: bazi.summary
    },
    dailyXiang: {
      date: fortune.date,
      moodKeyword: fortune.moodKeyword,
      overallScore: fortune.overallScore,
      summary: fortune.summary,
      yi: fortune.yi,
      ji: fortune.ji,
      luckyColor: fortune.luckyColor,
      actionSuggestion: fortune.actionSuggestion,
      cyberBlessing: fortune.cyberBlessing
    },
    history
  };
}

function normalizeAskAnswer(raw: Partial<AskAnswer>, source: AskAnswer['source']): AskAnswer {
  const fallback = source === 'safety_fallback' ? SAFETY_FALLBACK_ANSWER : GENERAL_FALLBACK_ANSWER;
  const suggestions = Array.isArray(raw.suggestions)
    ? raw.suggestions.filter(s => typeof s === 'string' && s.trim()).slice(0, 3)
    : fallback.suggestions;

  return {
    title: (raw.title || fallback.title).slice(0, 20),
    observation: (raw.observation || fallback.observation).slice(0, 80),
    innerState: (raw.innerState || fallback.innerState).slice(0, 80),
    suggestions: suggestions.length > 0 ? suggestions : fallback.suggestions,
    closingVerse: (raw.closingVerse || fallback.closingVerse).slice(0, 30),
    riskLevel: raw.riskLevel || fallback.riskLevel,
    safetyNote: raw.safetyNote || DEFAULT_SAFETY_NOTE,
    source: raw.source || source
  };
}

export function formatAnswerForHistory(answer: AskAnswer): string {
  return `${answer.title}：${answer.observation}`;
}

/** 发送问心请求，含前端高风险预检与失败兜底 */
export async function sendAskQuestion(
  request: AskRequest
): Promise<AskAnswer> {
  const question = (request.question || '').trim();
  if (!question) {
    return { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' };
  }

  const risk = detectQuestionRisk(question);
  if (risk.riskLevel === 'high') {
    return { ...SAFETY_FALLBACK_ANSWER };
  }

  try {
    const response = await Network.request({
      url: '/api/chat/message',
      method: 'POST',
      data: request
    });

    const data = response?.data?.data || response?.data;
    if (data?.answer) {
      return normalizeAskAnswer(data.answer as AskAnswer, data.answer.source || 'ai');
    }

    if (data?.content && typeof data.content === 'string') {
      return normalizeAskAnswer({ title: data.content.slice(0, 20), observation: data.content }, 'fallback');
    }

    return { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' };
  } catch {
    return { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' };
  }
}

export { MAX_ASK_QUESTION_LENGTH };
