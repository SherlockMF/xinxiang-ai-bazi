// 本地存储服务 - storageService
// 通过 storageAdapter 统一封装 Taro 同步存储

import type { UserProfile, BaziProfile, DailyFortune, FavoriteItem, FavoriteAdvice, ChatMessage, VisitStats, DailyXiangHistoryItem, ReminderPreference } from '../types';
import { normalizeUserProfile } from './birthUtils';
import { storage } from './storageAdapter';

/** 统一 storage key（新） */
export const STORAGE_KEYS = {
  PROFILES: 'xinxiang_profiles',
  BAZI_BY_USER: 'xinxiang_bazi_lite',
  ACTIVE_PROFILE_ID: 'xinxiang_active_profile_id',
  DAILY_XIANG_CACHE: 'xinxiang_daily_xiang_cache',
  FAVORITES: 'xinxiang_favorites',
  ASK_HISTORY: 'xinxiang_ask_history',
  REMINDER_PREFERENCE: 'xinxiang_reminder_preference',
  BAZI_ANALYSIS: 'xinxiang_bazi_analysis',
  PRIVACY_ACCEPTED: 'xinxiang_privacy_accepted',
  VISIT_STATS: 'xinxiang_visit_stats',
  DAILY_XIANG_HISTORY: 'xinxiang_daily_xiang_history'
} as const;

/** 旧 key，清除与迁移时使用 */
const LEGACY_STORAGE_KEYS = [
  'cyber_user_profile',
  'cyber_bazi_profile',
  'cyber_fortune_cache',
  'cyber_favorites',
  'cyber_chat_history',
  'cyber_reminder',
  'cyber_reminder_preference',
  'cyber_bazi_analysis',
  'cyber_profiles',
  'cyber_bazi_by_user',
  'cyber_active_profile_id'
] as const;

const LEGACY_TO_NEW: Record<string, string> = {
  cyber_profiles: STORAGE_KEYS.PROFILES,
  cyber_bazi_by_user: STORAGE_KEYS.BAZI_BY_USER,
  cyber_active_profile_id: STORAGE_KEYS.ACTIVE_PROFILE_ID,
  cyber_fortune_cache: STORAGE_KEYS.DAILY_XIANG_CACHE,
  cyber_favorites: STORAGE_KEYS.FAVORITES,
  cyber_chat_history: STORAGE_KEYS.ASK_HISTORY,
  cyber_reminder_preference: STORAGE_KEYS.REMINDER_PREFERENCE,
  cyber_reminder: STORAGE_KEYS.REMINDER_PREFERENCE,
  cyber_bazi_analysis: STORAGE_KEYS.BAZI_ANALYSIS
};

let storageMigrated = false;

/** 旧 key → 新 key 一次性迁移 */
export function migrateStorageKeysIfNeeded(): void {
  if (storageMigrated) return;
  storageMigrated = true;

  Object.entries(LEGACY_TO_NEW).forEach(([legacy, next]) => {
    const legacyVal = storage.getItem(legacy);
    const nextVal = storage.getItem(next);
    if (legacyVal && !nextVal) {
      storage.setItem(next, legacyVal);
    }
  });
}

/** 今日心象缓存 key：userId + 出生日期 + 时辰 + 当天日期 */
export function buildDailyCacheKey(
  userId: string,
  birthDate: string,
  date: string,
  timeBranch?: string
): string {
  return `${userId}_${birthDate}_${timeBranch || 'unknown'}_${date}`;
}

/**
 * 用户档案存储（legacy 单档案，仅迁移）
 */
export function saveUserProfile(user: UserProfile): void {
  try {
    storage.setItem('cyber_user_profile', JSON.stringify(user));
  } catch (error) {
    console.error('保存用户档案失败:', error);
  }
}

export function getUserProfile(): UserProfile | null {
  try {
    const stored = storage.getItem('cyber_user_profile');
    return stored ? normalizeUserProfile(JSON.parse(stored) as UserProfile) : null;
  } catch {
    return null;
  }
}

export function clearUserProfile(): void {
  storage.removeItem('cyber_user_profile');
}

export function saveBaziProfile(bazi: BaziProfile): void {
  try {
    storage.setItem('cyber_bazi_profile', JSON.stringify(bazi));
  } catch (error) {
    console.error('保存八字档案失败:', error);
  }
}

export function getBaziProfile(): BaziProfile | null {
  try {
    const stored = storage.getItem('cyber_bazi_profile');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearBaziProfile(): void {
  storage.removeItem('cyber_bazi_profile');
}

/**
 * 每日心象存储
 */
export function saveDailyFortune(
  fortune: DailyFortune,
  birthDate: string,
  timeBranch?: string
): void {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.DAILY_XIANG_CACHE) || '{}';
    const parsed = JSON.parse(cache) as Record<string, DailyFortune>;
    const key = buildDailyCacheKey(fortune.userId, birthDate, fortune.date, timeBranch);
    parsed[key] = fortune;
    storage.setItem(STORAGE_KEYS.DAILY_XIANG_CACHE, JSON.stringify(parsed));
  } catch (error) {
    console.error('保存今日心象失败:', error);
  }
}

export function getDailyFortune(
  userId: string,
  date: string,
  birthDate: string,
  timeBranch?: string
): DailyFortune | null {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.DAILY_XIANG_CACHE);
    if (!cache) return null;

    const parsed = JSON.parse(cache) as Record<string, DailyFortune>;
    const key = buildDailyCacheKey(userId, birthDate, date, timeBranch);
    if (parsed[key]) return parsed[key];

    // 兼容旧 key：userId_date
    return parsed[`${userId}_${date}`] || null;
  } catch {
    return null;
  }
}

export function clearDailyCacheForUser(userId: string): void {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.DAILY_XIANG_CACHE);
    if (!cache) return;
    const parsed = JSON.parse(cache) as Record<string, DailyFortune>;
    Object.keys(parsed).forEach(k => {
      if (k.startsWith(`${userId}_`) || parsed[k]?.userId === userId) {
        delete parsed[k];
      }
    });
    storage.setItem(STORAGE_KEYS.DAILY_XIANG_CACHE, JSON.stringify(parsed));
  } catch { /* 忽略 */ }
}

export function getAllFortunes(userId: string): DailyFortune[] {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.DAILY_XIANG_CACHE);
    if (!cache) return [];

    const parsed = JSON.parse(cache) as Record<string, DailyFortune>;
    return Object.entries(parsed)
      .filter(([key, fortune]) => key.startsWith(userId) || fortune?.userId === userId)
      .map(([, fortune]) => fortune)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function clearFortuneCache(): void {
  storage.removeItem(STORAGE_KEYS.DAILY_XIANG_CACHE);
  storage.removeItem('cyber_fortune_cache');
}

export function saveFavoriteItem(favorite: FavoriteItem): void {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    const all = stored ? (JSON.parse(stored) as (FavoriteItem | FavoriteAdvice)[]) : [];
    all.push(favorite);
    storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(all));
  } catch (error) {
    console.error('保存收藏失败:', error);
    throw error;
  }
}

/** @deprecated 请使用 saveFavoriteItem */
export function saveFavorite(favorite: FavoriteAdvice): void {
  saveFavoriteItem({
    id: favorite.id,
    userId: favorite.userId,
    type: favorite.type === 'blessing' ? 'daily_verse' : 'daily_xiang',
    title: favorite.type === 'blessing' ? '今日偈语' : '今日心象',
    content: favorite.content,
    sourceDate: favorite.createdAt.slice(0, 10),
    createdAt: favorite.createdAt
  });
}

export function getFavoritesRaw(userId: string): (FavoriteItem | FavoriteAdvice)[] {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return [];
    return (JSON.parse(stored) as (FavoriteItem | FavoriteAdvice)[])
      .filter(f => f.userId === userId);
  } catch {
    return [];
  }
}

export function getFavorites(userId: string): FavoriteItem[] {
  return getFavoritesRaw(userId) as FavoriteItem[];
}

export function removeFavorite(_userId: string, favoriteId: string): void {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return;
    const filtered = (JSON.parse(stored) as (FavoriteItem | FavoriteAdvice)[]).filter(f => f.id !== favoriteId);
    storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('移除收藏失败:', error);
  }
}

export function clearFavorites(): void {
  storage.removeItem(STORAGE_KEYS.FAVORITES);
}

export function saveChatMessage(message: ChatMessage): void {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.ASK_HISTORY);
    const all = stored ? (JSON.parse(stored) as ChatMessage[]) : [];
    all.push(message);
    const others = all.filter(m => m.userId !== message.userId);
    const mine = all.filter(m => m.userId === message.userId).slice(-50);
    storage.setItem(STORAGE_KEYS.ASK_HISTORY, JSON.stringify([...others, ...mine]));
  } catch (error) {
    console.error('保存对话失败:', error);
  }
}

export function getChatHistory(userId: string): ChatMessage[] {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.ASK_HISTORY);
    if (!stored) return [];
    return (JSON.parse(stored) as ChatMessage[]).filter(m => m.userId === userId);
  } catch {
    return [];
  }
}

export function clearChatHistory(): void {
  storage.removeItem(STORAGE_KEYS.ASK_HISTORY);
}

export function savePrivacyAccepted(userId: string, acceptedAt: string): void {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.PRIVACY_ACCEPTED) || '{}';
    const parsed = JSON.parse(stored) as Record<string, string>;
    parsed[userId] = acceptedAt;
    storage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, JSON.stringify(parsed));
  } catch { /* 忽略 */ }
}

function readProfilesRaw(): UserProfile[] {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.PROFILES);
    if (!stored) return [];
    return (JSON.parse(stored) as UserProfile[]).map(normalizeUserProfile);
  } catch {
    return [];
  }
}

export function getProfiles(): UserProfile[] {
  migrateStorageKeysIfNeeded();
  migrateLegacyProfileIfNeeded();
  return readProfilesRaw();
}

export function saveProfiles(profiles: UserProfile[]): void {
  migrateStorageKeysIfNeeded();
  storage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles.map(normalizeUserProfile)));
}

export function upsertProfile(profile: UserProfile): void {
  const normalized = normalizeUserProfile(profile);
  const list = getProfiles();
  const idx = list.findIndex(p => p.id === normalized.id);
  if (idx >= 0) list[idx] = normalized;
  else list.push(normalized);
  saveProfiles(list);
}

export function getActiveProfileId(): string | null {
  migrateStorageKeysIfNeeded();
  return storage.getItem(STORAGE_KEYS.ACTIVE_PROFILE_ID) || null;
}

export function setActiveProfileId(id: string): void {
  migrateStorageKeysIfNeeded();
  storage.setItem(STORAGE_KEYS.ACTIVE_PROFILE_ID, id);
}

function getBaziMap(): Record<string, BaziProfile> {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.BAZI_BY_USER);
    return stored ? (JSON.parse(stored) as Record<string, BaziProfile>) : {};
  } catch {
    return {};
  }
}

export function getBaziByUser(userId: string): BaziProfile | null {
  return getBaziMap()[userId] || null;
}

export function saveBaziForUser(bazi: BaziProfile): void {
  migrateStorageKeysIfNeeded();
  const map = getBaziMap();
  map[bazi.userId] = bazi;
  storage.setItem(STORAGE_KEYS.BAZI_BY_USER, JSON.stringify(map));
}

export function removeProfileData(userId: string): void {
  saveProfiles(getProfiles().filter(p => p.id !== userId));

  if (getActiveProfileId() === userId) {
    storage.removeItem(STORAGE_KEYS.ACTIVE_PROFILE_ID);
  }

  const baziMap = getBaziMap();
  delete baziMap[userId];
  storage.setItem(STORAGE_KEYS.BAZI_BY_USER, JSON.stringify(baziMap));

  clearDailyCacheForUser(userId);

  try {
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    if (stored) {
      const all = (JSON.parse(stored) as (FavoriteItem | FavoriteAdvice)[]).filter(f => f.userId !== userId);
      storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(all));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.ASK_HISTORY);
    if (stored) {
      const all = (JSON.parse(stored) as ChatMessage[]).filter(m => m.userId !== userId);
      storage.setItem(STORAGE_KEYS.ASK_HISTORY, JSON.stringify(all));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.BAZI_ANALYSIS);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, unknown>;
      delete parsed[userId];
      storage.setItem(STORAGE_KEYS.BAZI_ANALYSIS, JSON.stringify(parsed));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.PRIVACY_ACCEPTED);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, string>;
      delete parsed[userId];
      storage.setItem(STORAGE_KEYS.PRIVACY_ACCEPTED, JSON.stringify(parsed));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.VISIT_STATS);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, VisitStats>;
      delete parsed[userId];
      storage.setItem(STORAGE_KEYS.VISIT_STATS, JSON.stringify(parsed));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.DAILY_XIANG_HISTORY);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, DailyXiangHistoryItem[]>;
      delete parsed[userId];
      storage.setItem(STORAGE_KEYS.DAILY_XIANG_HISTORY, JSON.stringify(parsed));
    }
  } catch { /* 忽略 */ }

  try {
    const stored = storage.getItem(STORAGE_KEYS.REMINDER_PREFERENCE);
    if (stored) {
      const parsed = JSON.parse(stored) as Record<string, ReminderPreference>;
      delete parsed[userId];
      storage.setItem(STORAGE_KEYS.REMINDER_PREFERENCE, JSON.stringify(parsed));
    }
  } catch { /* 忽略 */ }
}

export function migrateLegacyProfileIfNeeded(): void {
  if (readProfilesRaw().length > 0) return;
  const legacy = getUserProfile();
  if (!legacy) return;

  const profile = normalizeUserProfile({
    ...legacy,
    relation: legacy.relation || 'self',
    nickname: legacy.nickname || '本人',
    unknownTime: legacy.unknownTime ?? false,
    privacyAccepted: legacy.privacyAccepted ?? legacy.privacyConsent ?? false
  });
  saveProfiles([profile]);
  setActiveProfileId(profile.id);

  const legacyBazi = getBaziProfile();
  if (legacyBazi) saveBaziForUser(legacyBazi);
}

/** 清除所有本地数据（含 legacy key） */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    storage.removeItem(key);
  });
  LEGACY_STORAGE_KEYS.forEach(key => {
    storage.removeItem(key);
  });
  storageMigrated = false;
}
