// 珍藏服务 - 统一收藏逻辑与去重

import type {
  AskAnswer,
  DailyFortune,
  FavoriteItem,
  FavoriteItemType,
  FavoriteAdvice
} from '../types/index.ts';
import {
  getFavoritesRaw,
  saveFavoriteItem,
  removeFavorite as removeFavoriteFromStorage
} from './storage-service.ts';

const SAFETY_NOTE = '内容仅作传统文化与自我观察参考，不构成现实决策建议。';

export function normalizeFavoriteItem(raw: FavoriteItem | FavoriteAdvice): FavoriteItem {
  const legacy = raw as FavoriteAdvice;
  if (
    'type' in raw &&
    (raw.type === 'daily_xiang' || raw.type === 'daily_verse' || raw.type === 'ask_answer')
  ) {
    return raw as FavoriteItem;
  }

  const typeMap: Record<string, FavoriteItemType> = {
    blessing: 'daily_verse',
    summary: 'daily_xiang',
    action: 'daily_xiang',
    yi: 'daily_xiang',
    ji: 'daily_xiang'
  };

  return {
    id: legacy.id,
    userId: legacy.userId,
    type: typeMap[legacy.type] || 'daily_verse',
    title: legacy.type === 'blessing' ? '今日偈语' : '今日心象',
    content: legacy.content,
    sourceDate: legacy.createdAt.slice(0, 10),
    createdAt: legacy.createdAt
  };
}

export function getFavoriteItems(userId: string): FavoriteItem[] {
  return getFavoritesRaw(userId)
    .map(normalizeFavoriteItem)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function findDuplicateFavorite(
  userId: string,
  type: FavoriteItemType,
  sourceDate?: string,
  title?: string
): FavoriteItem | null {
  const items = getFavoriteItems(userId);
  return (
    items.find((f) => {
      if (f.type !== type) return false;
      if (type === 'daily_xiang' || type === 'daily_verse') {
        return f.sourceDate === sourceDate;
      }
      if (type === 'ask_answer') {
        return f.sourceDate === sourceDate && f.title === title;
      }
      return false;
    }) || null
  );
}

export function isFavorited(
  userId: string,
  type: FavoriteItemType,
  sourceDate?: string,
  title?: string
): boolean {
  return !!findDuplicateFavorite(userId, type, sourceDate, title);
}

export function buildDailyXiangTitle(moodKeyword: string): string {
  return moodKeyword.includes('日') ? moodKeyword.replace(/日$/, '') : moodKeyword;
}

export function buildDailyXiangFavorite(userId: string, fortune: DailyFortune): FavoriteItem {
  const title = buildDailyXiangTitle(fortune.moodKeyword);
  return {
    id: `fav_xiang_${fortune.date}_${userId}`,
    userId,
    type: 'daily_xiang',
    title,
    content: `${fortune.moodKeyword} · ${fortune.summary}\n${fortune.actionSuggestion}`,
    sourceDate: fortune.date,
    payload: { dailyFortuneId: fortune.id, yi: fortune.yi.slice(0, 3), ji: fortune.ji.slice(0, 2) },
    createdAt: new Date().toISOString()
  };
}

export function buildDailyVerseFavorite(userId: string, fortune: DailyFortune): FavoriteItem {
  return {
    id: `fav_verse_${fortune.date}_${userId}`,
    userId,
    type: 'daily_verse',
    title: buildDailyXiangTitle(fortune.moodKeyword),
    content: fortune.cyberBlessing,
    sourceDate: fortune.date,
    payload: { dailyFortuneId: fortune.id },
    createdAt: new Date().toISOString()
  };
}

export function buildAskAnswerFavorite(
  userId: string,
  answer: AskAnswer,
  sourceDate: string,
  messageId: string
): FavoriteItem {
  return {
    id: `fav_ask_${messageId}`,
    userId,
    type: 'ask_answer',
    title: answer.title,
    content: `${answer.observation}\n${answer.closingVerse}`,
    sourceDate,
    payload: answer,
    createdAt: new Date().toISOString()
  };
}

export type AddFavoriteResult = 'added' | 'duplicate' | 'error';

export function addFavoriteItem(item: FavoriteItem): AddFavoriteResult {
  const dup = findDuplicateFavorite(item.userId, item.type, item.sourceDate, item.title);
  if (dup) return 'duplicate';
  try {
    saveFavoriteItem(item);
    return 'added';
  } catch {
    return 'error';
  }
}

export function removeFavoriteItem(userId: string, favoriteId: string): void {
  removeFavoriteFromStorage(userId, favoriteId);
}

export const FAVORITE_TYPE_LABELS: Record<FavoriteItemType, string> = {
  daily_xiang: '今日心象',
  daily_verse: '今日偈语',
  ask_answer: '问心回应'
};

export { SAFETY_NOTE as FAVORITE_SAFETY_NOTE };
