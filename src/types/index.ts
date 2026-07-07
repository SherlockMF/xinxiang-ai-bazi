// 核心类型定义 - 心象

// 命主关系标签
export type ProfileRelation = 'self' | 'family' | 'friend' | 'other';

// 关系中文展示
export const RELATION_LABELS: Record<ProfileRelation, string> = {
  self: '本人',
  family: '家人',
  friend: '朋友',
  other: '其他'
};

/** 出生信息字段（与 UserProfile 合并存储） */
export interface BirthProfileFields {
  calendarType: 'solar' | 'lunar';
  birthDate: string; // YYYY-MM-DD
  birthTime?: string; // HH:mm，unknownTime 时可为空
  timeBranch?: string; // 子时、丑时…或 unknown
  unknownTime: boolean;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthPlace?: string;
  privacyAccepted: boolean;
  privacyAcceptedAt?: string;
}

/** 出生信息结构别名 */
export type BirthProfile = BirthProfileFields;

// 用户档案（一位本心）
export interface UserProfile extends BirthProfileFields {
  id: string;
  nickname?: string;
  relation?: ProfileRelation;
  createdAt: string;
  updatedAt: string;
  /** @deprecated 请使用 privacyAccepted，读取时由 normalizeUserProfile 同步 */
  privacyConsent?: boolean;
}

// 八字档案
export interface BaziProfile {
  id: string;
  userId: string;
  // 四柱
  yearPillar: string; // 年柱（如：甲子）
  monthPillar: string; // 月柱
  dayPillar: string; // 日柱
  hourPillar: string; // 时柱
  // 日主
  dayMaster: string; // 日干（如：甲）
  // 五行能量
  fiveElements: {
    wood: number; // 0-100
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
  // 喜用五行（内部统一使用英文枚举，展示时用 ELEMENT_LABELS 转中文）
  favorableElements: FiveElementType[];
  // 性格标签
  personalityTags: string[];
  // 心象盘摘要
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// 每日心象
export interface DailyFortune {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  // 综合分数
  overallScore: number; // 0-100
  // 情绪关键词
  moodKeyword: string;
  // 心象摘要
  summary: string;
  // 今日宜
  yi: string[];
  // 今日忌
  ji: string[];
  // 幸运元素
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
  // 行动建议
  actionSuggestion: string;
  // 心象偈语
  cyberBlessing: string;
  // AI原始返回（可选）
  aiRawJson?: unknown;
  createdAt: string;
}

/** 今日心象本地缓存 map */
export type DailyXiangCacheMap = Record<string, DailyFortune>;

/** 签亭海报数据 */
export interface PosterPayload {
  id: string;
  date: string;
  title: string;
  subtitle?: string;
  verse: string;
  summary?: string;
  yi: string[];
  ji: string[];
  brand: string;
  safetyNote?: string;
  qrcodeUrl?: string;
  createdAt: string;
}

/** 珍藏类型 */
export type FavoriteItemType = 'daily_xiang' | 'daily_verse' | 'ask_answer';

/** 统一珍藏项 */
export interface FavoriteItem {
  id: string;
  userId: string;
  type: FavoriteItemType;
  title: string;
  content: string;
  sourceDate?: string;
  payload?: unknown;
  createdAt: string;
}

/** @deprecated 请使用 FavoriteItem，读取时由 normalizeFavoriteItem 迁移 */
export interface FavoriteAdvice {
  id: string;
  userId: string;
  dailyFortuneId: string;
  content: string;
  type: 'summary' | 'action' | 'blessing' | 'yi' | 'ji';
  createdAt: string;
}

// 提醒偏好（每日心约）
export interface ReminderPreference {
  enabled: boolean;
  time: string; // HH:mm
  channel: 'local' | 'wechat_subscribe' | 'douyin_subscribe';
  lastRequestedAt?: string;
  updatedAt: string;
  /** @deprecated 兼容旧字段 */
  id?: string;
  userId?: string;
  reminderTime?: string;
  timezone?: string;
  lastSentAt?: string;
}

/** 连续观心统计 */
export interface VisitStats {
  firstVisitDate?: string;
  lastVisitDate?: string;
  streakDays: number;
  totalVisitDays: number;
  visitedDates: string[];
  updatedAt: string;
}

/** 历史心象条目 */
export interface DailyXiangHistoryItem {
  date: string;
  title: string;
  verse: string;
  keywords?: string[];
  createdAt: string;
}

// 心象深度解读报告（AI 生成）
export interface BaziAnalysisReport {
  userId: string;
  // Markdown 文本
  content: string;
  createdAt: string;
}

// 对话消息
export interface ChatMessage {
  id: string;
  userId: string;
  dailyFortuneId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  sourceDate?: string;
  /** 结构化心象回应（assistant 消息） */
  answer?: AskAnswer;
  questionType?: AskQuestionType;
}

// ========== 问心 AI 类型 ==========

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

// 单柱结构
export interface Pillar {
  heavenlyStem: HeavenlyStem; // 天干
  earthlyBranch: EarthlyBranch; // 地支
  fullPillar: string; // 完整柱（如：甲子）
}

// 五行类型
export type FiveElementType = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

// 五行中文展示 label map（仅用于页面/文案展示，内部数据一律使用英文枚举）
export const ELEMENT_LABELS: Record<FiveElementType, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水'
};

// 将五行英文枚举转为中文 label
export function getElementLabel(element: FiveElementType): string {
  return ELEMENT_LABELS[element] ?? String(element);
}

// 天干
export type HeavenlyStem = '甲' | '乙' | '丙' | '丁' | '戊' | '己' | '庚' | '辛' | '壬' | '癸';

// 地支
export type EarthlyBranch = '子' | '丑' | '寅' | '卯' | '辰' | '巳' | '午' | '未' | '申' | '酉' | '戌' | '亥';

// LLM Provider 配置
export interface LLMConfig {
  provider: 'doubao' | 'deepseek' | 'kimi' | 'openai';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

// LLM 响应
export interface LLMResponse {
  content: string;
  raw?: unknown;
}
