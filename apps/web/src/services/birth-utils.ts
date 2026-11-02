// 出生信息与日期工具

import type { UserProfile } from '../types/index.ts';

/** 时辰映射（23:00-00:59 均为子时） */
export const TIME_BRANCH_MAP = [
  { branch: '子时', startHour: 23, endHour: 0 },
  { branch: '丑时', startHour: 1, endHour: 2 },
  { branch: '寅时', startHour: 3, endHour: 4 },
  { branch: '卯时', startHour: 5, endHour: 6 },
  { branch: '辰时', startHour: 7, endHour: 8 },
  { branch: '巳时', startHour: 9, endHour: 10 },
  { branch: '午时', startHour: 11, endHour: 12 },
  { branch: '未时', startHour: 13, endHour: 14 },
  { branch: '申时', startHour: 15, endHour: 16 },
  { branch: '酉时', startHour: 17, endHour: 18 },
  { branch: '戌时', startHour: 19, endHour: 20 },
  { branch: '亥时', startHour: 21, endHour: 22 }
] as const;

export type TimeBranch = (typeof TIME_BRANCH_MAP)[number]['branch'] | 'unknown';

/** 今日日期 YYYY-MM-DD（本地时区） */
export function getTodayDateString(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
}

/** 出生日期是否晚于今天 */
export function isFutureBirthDate(birthDate: string, today = getTodayDateString()): boolean {
  return birthDate > today;
}

/** HH:mm → 时辰名 */
export function timeToBranch(time: string): TimeBranch {
  const [hStr] = time.split(':');
  const hour = Number(hStr);
  if (Number.isNaN(hour)) return 'unknown';

  if (hour === 23 || hour === 0) return '子时';

  for (const item of TIME_BRANCH_MAP) {
    if (item.branch === '子时') continue;
    if (hour >= item.startHour && hour <= item.endHour) {
      return item.branch;
    }
  }
  return 'unknown';
}

/** 排盘用默认时辰（未知时辰时用正午） */
export function resolveBirthTimeForChart(profile: Pick<UserProfile, 'birthTime' | 'unknownTime'>): string {
  if (profile.unknownTime || !profile.birthTime) {
    return '12:00';
  }
  return profile.birthTime;
}

/** 今日心象稳定随机种子 */
export function buildDailySeed(
  profile: Pick<UserProfile, 'birthDate' | 'timeBranch' | 'unknownTime'>,
  date: string
): string {
  const branch = profile.unknownTime ? 'unknown' : profile.timeBranch || 'unknown';
  return `${profile.birthDate}_${branch}_${date}`;
}

/** 基于 seed 的伪随机 [0, 1) */
export function createSeededRandom(seed: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 从数组中按 seed 选取 n 个（不重复，顺序稳定） */
export function seededPick<T>(items: T[], count: number, rand: () => number): T[] {
  if (items.length === 0) return [];
  const indices = items.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(count, items.length)).map((i) => items[i]);
}

/** 从数组中按 seed 选一项 */
export function seededPickOne<T>(items: T[], rand: () => number): T {
  return items[Math.floor(rand() * items.length)];
}

/** 归一化旧档案字段（兼容 privacyConsent 等） */
export function normalizeUserProfile(raw: UserProfile): UserProfile {
  const privacyAccepted = raw.privacyAccepted ?? raw.privacyConsent ?? false;
  const unknownTime = raw.unknownTime ?? false;
  const birthTime = unknownTime ? raw.birthTime || undefined : raw.birthTime || '12:00';
  const timeBranch = unknownTime
    ? raw.timeBranch || 'unknown'
    : raw.timeBranch || (birthTime ? timeToBranch(birthTime) : 'unknown');

  return {
    ...raw,
    calendarType: raw.calendarType || 'solar',
    unknownTime,
    birthTime,
    timeBranch,
    privacyAccepted,
    privacyAcceptedAt: raw.privacyAcceptedAt,
    privacyConsent: privacyAccepted
  };
}
