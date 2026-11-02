// 问心 AI 输入 / 输出类型

export type AskQuestionType =
  | 'relationship'
  | 'career'
  | 'emotion'
  | 'social'
  | 'self'
  | 'general';

export type RiskLevel = 'low' | 'medium' | 'high';

export type AskAnswerSource = 'ai' | 'fallback' | 'safety_fallback';

export interface BirthProfileLite {
  calendarType?: string;
  birthDate?: string;
  timeBranch?: string;
  unknownTime?: boolean;
  gender?: string;
}

export interface BaziLite {
  dayMaster?: string;
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;
  favorableElements?: string[];
  personalityTags?: string[];
  summary?: string;
}

export interface DailyXiangLite {
  date?: string;
  moodKeyword?: string;
  overallScore?: number;
  summary?: string;
  yi?: string[];
  ji?: string[];
  luckyColor?: string;
  actionSuggestion?: string;
  cyberBlessing?: string;
}

export interface AskRequest {
  userId?: string;
  questionType?: AskQuestionType;
  question: string;
  birthProfile?: BirthProfileLite;
  baziLite?: BaziLite;
  dailyXiang?: DailyXiangLite;
  /** @deprecated 兼容旧字段 */
  bazi?: BaziLite;
  /** @deprecated 兼容旧字段 */
  fortune?: DailyXiangLite;
  history?: Array<{ role: string; content: string }>;
}

export interface AskAnswer {
  title: string;
  observation: string;
  innerState: string;
  suggestions: string[];
  closingVerse: string;
  riskLevel: RiskLevel;
  safetyNote: string;
  source: AskAnswerSource;
}

export interface AskResponse {
  id: string;
  userId: string;
  role: 'assistant';
  content: string;
  answer: AskAnswer;
  createdAt: string;
}
