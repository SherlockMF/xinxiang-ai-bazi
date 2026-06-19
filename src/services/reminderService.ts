// 提醒服务 - reminderService
// 管理每日运势提醒偏好

import type { ReminderPreference } from '../types';
import { storage } from './storageAdapter';

// 本地存储 key
const REMINDER_KEY = 'cyber_reminder_preference';

// 默认提醒配置
const DEFAULT_REMINDER: ReminderPreference = {
  id: 'reminder_default',
  userId: '',
  enabled: false,
  reminderTime: '08:00',
  timezone: 'Asia/Shanghai',
  channel: 'in_app',
  updatedAt: new Date().toISOString()
};

/**
 * 获取提醒偏好
 */
export function getReminderPreference(userId: string): ReminderPreference {
  try {
    const stored = storage.getItem(REMINDER_KEY);
    if (!stored) {
      const defaultReminder = { ...DEFAULT_REMINDER, userId };
      return defaultReminder;
    }
    
    const parsed = JSON.parse(stored) as ReminderPreference;
    return { ...parsed, userId };
  } catch {
    return { ...DEFAULT_REMINDER, userId };
  }
}

/**
 * 保存提醒偏好
 */
export function saveReminderPreference(preference: ReminderPreference): void {
  try {
    preference.updatedAt = new Date().toISOString();
    storage.setItem(REMINDER_KEY, JSON.stringify(preference));
  } catch {
    console.error('保存提醒偏好失败');
  }
}

/**
 * 更新提醒开关
 */
export function updateReminderEnabled(userId: string, enabled: boolean): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.enabled = enabled;
  saveReminderPreference(preference);
  return preference;
}

/**
 * 更新提醒时间
 */
export function updateReminderTime(userId: string, time: string): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.reminderTime = time;
  saveReminderPreference(preference);
  return preference;
}

/**
 * 更新提醒渠道
 */
export function updateReminderChannel(userId: string, channel: 'in_app' | 'wechat_subscribe'): ReminderPreference {
  const preference = getReminderPreference(userId);
  preference.channel = channel;
  saveReminderPreference(preference);
  return preference;
}

/**
 * 检查是否需要发送提醒
 * 当前版本仅保存提醒偏好、不发送系统通知，因此恒返回 needSend=false。
 * 后续接入微信/抖音订阅消息后，可在此判断是否到达提醒时间并触发推送。
 */
export function checkReminderNeed(userId: string): {
  needSend: boolean;
  preference: ReminderPreference;
} {
  const preference = getReminderPreference(userId);

  // 当前版本：不实际发送提醒
  return {
    needSend: false,
    preference
  };
}

/**
 * 发送订阅消息（预留扩展点）
 * 后续可在此接入微信 / 抖音订阅消息 API。
 * 当前版本不发送任何通知，直接返回 false。
 */
export async function sendSubscribeMessage(
  _userId: string,
  _fortuneSummary: string,
  _channel: 'wechat_subscribe' | 'douyin_subscribe' = 'wechat_subscribe'
): Promise<boolean> {
  // TODO: 接入微信 / 抖音订阅消息 API（注意不要在日志中打印运势正文等敏感内容）
  return false;
}

/**
 * 导出默认配置
 */
export { DEFAULT_REMINDER };