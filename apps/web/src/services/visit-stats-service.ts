// 连续观心统计

import type { VisitStats } from '../types/index.ts';
import { getTodayDateString } from './birth-utils.ts';
import { STORAGE_KEYS, migrateStorageKeysIfNeeded } from './storage-service.ts';
import { storage } from './storage-adapter.ts';

const MAX_VISITED_DATES = 30;

function getStatsMap(): Record<string, VisitStats> {
  try {
    migrateStorageKeysIfNeeded();
    const raw = storage.getItem(STORAGE_KEYS.VISIT_STATS);
    return raw ? (JSON.parse(raw) as Record<string, VisitStats>) : {};
  } catch {
    return {};
  }
}

function saveStatsMap(map: Record<string, VisitStats>): void {
  migrateStorageKeysIfNeeded();
  storage.setItem(STORAGE_KEYS.VISIT_STATS, JSON.stringify(map));
}

function emptyStats(): VisitStats {
  return {
    streakDays: 0,
    totalVisitDays: 0,
    visitedDates: [],
    updatedAt: new Date().toISOString()
  };
}

function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dayBefore(date: string): string {
  const d = parseDate(date);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

export function getVisitStats(userId: string): VisitStats {
  const map = getStatsMap();
  return map[userId] || emptyStats();
}

/** 记录今日访问（同一天只计一次） */
export function recordVisit(userId: string, date = getTodayDateString()): VisitStats {
  const map = getStatsMap();
  const prev = map[userId] || emptyStats();

  if (prev.visitedDates.includes(date)) {
    return prev;
  }

  const visitedDates = [...prev.visitedDates, date].sort().slice(-MAX_VISITED_DATES);

  let streakDays = 1;
  if (prev.lastVisitDate) {
    const yesterday = dayBefore(date);
    if (prev.lastVisitDate === yesterday) {
      streakDays = prev.streakDays + 1;
    } else if (prev.lastVisitDate === date) {
      streakDays = prev.streakDays;
    }
  }

  const stats: VisitStats = {
    firstVisitDate: prev.firstVisitDate || date,
    lastVisitDate: date,
    streakDays,
    totalVisitDays: visitedDates.length,
    visitedDates,
    updatedAt: new Date().toISOString()
  };

  map[userId] = stats;
  saveStatsMap(map);
  return stats;
}

export function getStreakDisplayText(stats: VisitStats): string {
  if (stats.streakDays <= 0 || stats.totalVisitDays <= 0) {
    return '今日初见，愿此刻安定';
  }
  if (stats.streakDays === 1 && stats.totalVisitDays === 1) {
    return '今日初见，愿此刻安定';
  }
  return `已连续观心 ${stats.streakDays} 天`;
}

export function clearVisitStatsForUser(userId: string): void {
  const map = getStatsMap();
  delete map[userId];
  saveStatsMap(map);
}

export function clearAllVisitStats(): void {
  storage.removeItem(STORAGE_KEYS.VISIT_STATS);
}
