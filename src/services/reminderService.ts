// 提醒服务 - reminderService
// 管理每日运势提醒偏好

import type { ReminderPreference } from '../types';

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
    const stored = localStorage.getItem(REMINDER_KEY);
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
    localStorage.setItem(REMINDER_KEY, JSON.stringify(preference));
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
 * 检查是否需要发送提醒（MVP 版本：仅返回配置）
 * TODO: 实现真实的提醒触发逻辑
 */
export function checkReminderNeed(userId: string): {
  needSend: boolean;
  preference: ReminderPreference;
} {
  const preference = getReminderPreference(userId);
  
  // MVP 版本：不实际发送提醒
  return {
    needSend: false,
    preference
  };
}

/**
 * 发送微信订阅消息（预留接口）
 * TODO: 接入微信订阅消息 API
 */
export async function sendWechatSubscribeMessage(userId: string, fortuneSummary: string): Promise<boolean> {
  console.log('[reminderService] 预留：发送微信订阅消息');
  console.log('[reminderService] userId:', userId);
  console.log('[reminderService] fortuneSummary:', fortuneSummary);
  
  // MVP 版本：返回 false，表示未实际发送
  return false;
}

/**
 * 导出默认配置
 */
export { DEFAULT_REMINDER };