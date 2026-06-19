// 核心类型定义 - 赛博灵频

// 用户档案
export interface UserProfile {
  id: string;
  nickname?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthPlace?: string;
  calendarType: 'solar' | 'lunar';
  privacyConsent: boolean;
  createdAt: string;
  updatedAt: string;
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
  // 命盘摘要
  summary: string;
  createdAt: string;
  updatedAt: string;
}

// 每日运势
export interface DailyFortune {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  // 综合分数
  overallScore: number; // 0-100
  // 情绪关键词
  moodKeyword: string;
  // 运势摘要
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
  // 赛博祝福语
  cyberBlessing: string;
  // AI原始返回（可选）
  aiRawJson?: unknown;
  createdAt: string;
}

// 收藏建议
export interface FavoriteAdvice {
  id: string;
  userId: string;
  dailyFortuneId: string;
  content: string;
  type: 'summary' | 'action' | 'blessing' | 'yi' | 'ji';
  createdAt: string;
}

// 提醒偏好
export interface ReminderPreference {
  id: string;
  userId: string;
  enabled: boolean;
  reminderTime: string; // HH:mm
  timezone: string;
  channel: 'in_app' | 'wechat_subscribe';
  lastSentAt?: string;
  updatedAt: string;
}

// 八字深度分析报告（AI 生成）
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