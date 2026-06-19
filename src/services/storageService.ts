// 本地存储服务 - storageService
// 通过 storageAdapter 统一封装 Taro 同步存储，预留 Supabase/云开发接入位置

import type { UserProfile, BaziProfile, DailyFortune, FavoriteAdvice, ChatMessage } from '../types';
import { storage } from './storageAdapter';

// 存储 keys
const STORAGE_KEYS = {
  USER_PROFILE: 'cyber_user_profile',
  BAZI_PROFILE: 'cyber_bazi_profile',
  FORTUNE_CACHE: 'cyber_fortune_cache',
  FAVORITES: 'cyber_favorites',
  CHAT_HISTORY: 'cyber_chat_history',
  REMINDER: 'cyber_reminder',
  // AI 深度命理分析缓存（与 analysisService 中的 key 保持一致）
  BAZI_ANALYSIS: 'cyber_bazi_analysis'
};

/**
 * 用户档案存储
 */
export function saveUserProfile(user: UserProfile): void {
  try {
    storage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
  } catch (error) {
    console.error('保存用户档案失败:', error);
  }
}

export function getUserProfile(): UserProfile | null {
  try {
    const stored = storage.getItem(STORAGE_KEYS.USER_PROFILE);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearUserProfile(): void {
  storage.removeItem(STORAGE_KEYS.USER_PROFILE);
}

/**
 * 八字档案存储
 */
export function saveBaziProfile(bazi: BaziProfile): void {
  try {
    storage.setItem(STORAGE_KEYS.BAZI_PROFILE, JSON.stringify(bazi));
  } catch (error) {
    console.error('保存八字档案失败:', error);
  }
}

export function getBaziProfile(): BaziProfile | null {
  try {
    const stored = storage.getItem(STORAGE_KEYS.BAZI_PROFILE);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function clearBaziProfile(): void {
  storage.removeItem(STORAGE_KEYS.BAZI_PROFILE);
}

/**
 * 每日运势存储
 */
export function saveDailyFortune(fortune: DailyFortune): void {
  try {
    const cache = storage.getItem(STORAGE_KEYS.FORTUNE_CACHE) || '{}';
    const parsed = JSON.parse(cache);
    const key = `${fortune.userId}_${fortune.date}`;
    parsed[key] = fortune;
    storage.setItem(STORAGE_KEYS.FORTUNE_CACHE, JSON.stringify(parsed));
  } catch (error) {
    console.error('保存运势失败:', error);
  }
}

export function getDailyFortune(userId: string, date: string): DailyFortune | null {
  try {
    const cache = storage.getItem(STORAGE_KEYS.FORTUNE_CACHE);
    if (!cache) return null;
    
    const parsed = JSON.parse(cache);
    return parsed[`${userId}_${date}`] || null;
  } catch {
    return null;
  }
}

export function getAllFortunes(userId: string): DailyFortune[] {
  try {
    const cache = storage.getItem(STORAGE_KEYS.FORTUNE_CACHE);
    if (!cache) return [];
    
    const parsed = JSON.parse(cache);
    return Object.entries(parsed)
      .filter(([key]) => key.startsWith(userId))
      .map(([, fortune]) => fortune as DailyFortune)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}

export function clearFortuneCache(): void {
  storage.removeItem(STORAGE_KEYS.FORTUNE_CACHE);
}

/**
 * 收藏存储
 */
export function saveFavorite(favorite: FavoriteAdvice): void {
  try {
    const favorites = getFavorites(favorite.userId);
    favorites.push(favorite);
    storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  } catch (error) {
    console.error('保存收藏失败:', error);
  }
}

export function getFavorites(userId: string): FavoriteAdvice[] {
  try {
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored) as FavoriteAdvice[];
    return parsed.filter(f => f.userId === userId);
  } catch {
    return [];
  }
}

export function removeFavorite(_userId: string, favoriteId: string): void {
  try {
    const stored = storage.getItem(STORAGE_KEYS.FAVORITES);
    if (!stored) return;
    
    const parsed = JSON.parse(stored) as FavoriteAdvice[];
    const filtered = parsed.filter(f => f.id !== favoriteId);
    storage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
  } catch (error) {
    console.error('移除收藏失败:', error);
  }
}

export function clearFavorites(): void {
  storage.removeItem(STORAGE_KEYS.FAVORITES);
}

/**
 * 对话历史存储
 */
export function saveChatMessage(message: ChatMessage): void {
  try {
    const history = getChatHistory(message.userId);
    history.push(message);
    // 保留最近 50 条
    const trimmed = history.slice(-50);
    storage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('保存对话失败:', error);
  }
}

export function getChatHistory(userId: string): ChatMessage[] {
  try {
    const stored = storage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!stored) return [];
    
    const parsed = JSON.parse(stored) as ChatMessage[];
    return parsed.filter(m => m.userId === userId);
  } catch {
    return [];
  }
}

export function clearChatHistory(): void {
  storage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
}

/**
 * 清除所有本地数据
 */
export function clearAllData(): void {
  Object.values(STORAGE_KEYS).forEach(key => {
    storage.removeItem(key);
  });
}

/**
 * 导出存储 keys 供其他服务使用
 */
export { STORAGE_KEYS };