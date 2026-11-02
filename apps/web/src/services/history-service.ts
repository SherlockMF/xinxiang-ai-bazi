// 近七日心象历史

import type { DailyFortune, DailyXiangHistoryItem } from '../types/index.ts';
import { buildDailyXiangTitle } from './favorite-service.ts';
import { STORAGE_KEYS, migrateStorageKeysIfNeeded } from './storage-service.ts';
import { storage } from './storage-adapter.ts';

const MAX_STORED_DAYS = 30;

function getHistoryMap(): Record<string, DailyXiangHistoryItem[]> {
  try {
    migrateStorageKeysIfNeeded();
    const raw = storage.getItem(STORAGE_KEYS.DAILY_XIANG_HISTORY);
    return raw ? (JSON.parse(raw) as Record<string, DailyXiangHistoryItem[]>) : {};
  } catch {
    return {};
  }
}

function saveHistoryMap(map: Record<string, DailyXiangHistoryItem[]>): void {
  migrateStorageKeysIfNeeded();
  storage.setItem(STORAGE_KEYS.DAILY_XIANG_HISTORY, JSON.stringify(map));
}

export function fortuneToHistoryItem(fortune: DailyFortune): DailyXiangHistoryItem {
  return {
    date: fortune.date,
    title: buildDailyXiangTitle(fortune.moodKeyword),
    verse: fortune.cyberBlessing,
    keywords: [fortune.moodKeyword, ...fortune.yi.slice(0, 2)].filter(Boolean),
    createdAt: fortune.createdAt || new Date().toISOString()
  };
}

/** 写入或更新某日历史（同一天只保留一条） */
export function appendDailyHistory(userId: string, fortune: DailyFortune): void {
  const map = getHistoryMap();
  const list = map[userId] || [];
  const item = fortuneToHistoryItem(fortune);
  const filtered = list.filter((h) => h.date !== item.date);
  const next = [item, ...filtered].sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_STORED_DAYS);
  map[userId] = next;
  saveHistoryMap(map);
}

export function getRecentHistory(userId: string, limit = 7): DailyXiangHistoryItem[] {
  const map = getHistoryMap();
  return (map[userId] || []).slice(0, limit);
}

export function clearDailyHistoryForUser(userId: string): void {
  const map = getHistoryMap();
  delete map[userId];
  saveHistoryMap(map);
}

export function clearAllDailyHistory(): void {
  storage.removeItem(STORAGE_KEYS.DAILY_XIANG_HISTORY);
}
