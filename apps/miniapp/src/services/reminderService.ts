// 每日心约提醒服务

import type { ReminderPreference } from '../types';
import { storage } from './storageAdapter';
import { STORAGE_KEYS, migrateStorageKeysIfNeeded } from './storageService';

export const DEFAULT_REMINDER: ReminderPreference = {
  enabled: false,
  time: '08:30',
  channel: 'local',
  updatedAt: new Date().toISOString()
};

export type ReminderPermissionResult = {
  success: boolean;
  reason: 'not_implemented' | 'skipped' | 'error';
};

function normalizePreference(raw: Partial<ReminderPreference>): ReminderPreference {
  const time = raw.time || raw.reminderTime || DEFAULT_REMINDER.time;
  let channel = raw.channel || 'local';
  if (channel === ('in_app' as ReminderPreference['channel'])) {
    channel = 'local';
  }
  return {
    enabled: raw.enabled ?? false,
    time,
    channel: channel as ReminderPreference['channel'],
    lastRequestedAt: raw.lastRequestedAt,
    updatedAt: raw.updatedAt || new Date().toISOString(),
    id: raw.id,
    userId: raw.userId,
    reminderTime: time,
    timezone: raw.timezone,
    lastSentAt: raw.lastSentAt
  };
}

function getReminderMap(): Record<string, ReminderPreference> {
  try {
    migrateStorageKeysIfNeeded();
    const stored = storage.getItem(STORAGE_KEYS.REMINDER_PREFERENCE);
    if (!stored) return {};

    const parsed = JSON.parse(stored) as Record<string, ReminderPreference> | ReminderPreference;
    if (
      parsed &&
      typeof parsed === 'object' &&
      'enabled' in parsed &&
      ('time' in parsed || 'reminderTime' in parsed)
    ) {
      const legacy = normalizePreference(parsed as ReminderPreference);
      const userId = legacy.userId || 'local';
      return { [userId]: legacy };
    }
    const map: Record<string, ReminderPreference> = {};
    Object.entries(parsed as Record<string, ReminderPreference>).forEach(([uid, pref]) => {
      map[uid] = normalizePreference(pref);
    });
    return map;
  } catch {
    return {};
  }
}

function saveReminderMap(map: Record<string, ReminderPreference>): void {
  migrateStorageKeysIfNeeded();
  storage.setItem(STORAGE_KEYS.REMINDER_PREFERENCE, JSON.stringify(map));
}

export function getReminderPreference(userId: string): ReminderPreference {
  const map = getReminderMap();
  return map[userId] ? normalizePreference(map[userId]) : { ...DEFAULT_REMINDER, userId };
}

export function saveReminderPreference(userId: string, preference: ReminderPreference): void {
  const map = getReminderMap();
  const normalized = normalizePreference({
    ...preference,
    userId,
    updatedAt: new Date().toISOString()
  });
  map[userId] = normalized;
  saveReminderMap(map);
}

export function updateReminderEnabled(userId: string, enabled: boolean): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.enabled = enabled;
  saveReminderPreference(userId, preference);
  return preference;
}

export function updateReminderTime(userId: string, time: string): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.time = time;
  preference.reminderTime = time;
  saveReminderPreference(userId, preference);
  return preference;
}

export function updateReminderChannel(
  userId: string,
  channel: ReminderPreference['channel']
): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.channel = channel;
  saveReminderPreference(userId, preference);
  return preference;
}

export function checkReminderNeed(userId: string): {
  needSend: boolean;
  preference: ReminderPreference;
} {
  return {
    needSend: false,
    preference: getReminderPreference(userId)
  };
}

/** 订阅消息权限预留（本轮不实际接入） */
export async function requestDailyReminderPermission(
  _preference: ReminderPreference
): Promise<ReminderPermissionResult> {
  return {
    success: false,
    reason: 'not_implemented'
  };
}

/** @deprecated 请使用 requestDailyReminderPermission */
export async function sendSubscribeMessage(
  _userId: string,
  _fortuneSummary: string,
  _channel: 'wechat_subscribe' | 'douyin_subscribe' = 'wechat_subscribe'
): Promise<boolean> {
  return false;
}

export function clearReminderForUser(userId: string): void {
  const map = getReminderMap();
  delete map[userId];
  saveReminderMap(map);
}

export function clearAllReminderPreferences(): void {
  storage.removeItem(STORAGE_KEYS.REMINDER_PREFERENCE);
}
