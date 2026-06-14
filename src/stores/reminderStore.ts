// 提醒状态管理 - reminderStore
// 管理提醒偏好设置

import { create } from 'zustand';
import type { ReminderPreference } from '../types';
import { getReminderPreference, saveReminderPreference, updateReminderEnabled, updateReminderTime, updateReminderChannel } from '../services/reminderService';

interface ReminderState {
  // 提醒偏好
  preference: ReminderPreference | null;
  // 错误信息
  error: string | null;
  
  // Actions
  // 加载提醒偏好
  loadPreference: (userId: string) => void;
  // 设置提醒偏好
  setPreference: (preference: ReminderPreference) => void;
  // 更新开关状态
  updateEnabled: (userId: string, enabled: boolean) => void;
  // 更新提醒时间
  updateTime: (userId: string, time: string) => void;
  // 更新提醒渠道
  updateChannel: (userId: string, channel: 'in_app' | 'wechat_subscribe') => void;
  // 设置错误
  setError: (error: string | null) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  preference: null,
  error: null,
  
  loadPreference: (userId: string) => {
    const preference = getReminderPreference(userId);
    set({ preference });
  },
  
  setPreference: (preference: ReminderPreference) => {
    saveReminderPreference(preference);
    set({ preference });
  },
  
  updateEnabled: (userId: string, enabled: boolean) => {
    const preference = updateReminderEnabled(userId, enabled);
    set({ preference });
  },
  
  updateTime: (userId: string, time: string) => {
    const preference = updateReminderTime(userId, time);
    set({ preference });
  },
  
  updateChannel: (userId: string, channel: 'in_app' | 'wechat_subscribe') => {
    const preference = updateReminderChannel(userId, channel);
    set({ preference });
  },
  
  setError: (error: string | null) => {
    set({ error });
  }
}));