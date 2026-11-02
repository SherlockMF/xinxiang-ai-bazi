// 提醒状态管理 - reminderStore

import { create } from 'zustand';
import Taro from '@tarojs/taro';
import type { ReminderPreference } from '../types';
import {
  getReminderPreference,
  saveReminderPreference,
  updateReminderEnabled,
  updateReminderTime,
  requestDailyReminderPermission
} from '../services/reminderService';

interface ReminderState {
  preference: ReminderPreference | null;
  error: string | null;

  loadPreference: (userId: string) => void;
  setPreference: (userId: string, preference: ReminderPreference) => void;
  updateEnabled: (userId: string, enabled: boolean) => void;
  updateTime: (userId: string, time: string) => void;
  saveSettings: (userId: string, enabled: boolean, time: string) => Promise<void>;
  clearPreference: () => void;
  setError: (error: string | null) => void;
}

export const useReminderStore = create<ReminderState>((set) => ({
  preference: null,
  error: null,

  loadPreference: (userId: string) => {
    set({ preference: getReminderPreference(userId) });
  },

  setPreference: (userId: string, preference: ReminderPreference) => {
    saveReminderPreference(userId, preference);
    set({ preference: getReminderPreference(userId) });
  },

  updateEnabled: (userId: string, enabled: boolean) => {
    const preference = updateReminderEnabled(userId, enabled);
    set({ preference });
  },

  updateTime: (userId: string, time: string) => {
    const preference = updateReminderTime(userId, time);
    set({ preference });
  },

  saveSettings: async (userId: string, enabled: boolean, time: string) => {
    const preference: ReminderPreference = {
      ...getReminderPreference(userId),
      enabled,
      time,
      reminderTime: time,
      channel: 'local',
      lastRequestedAt: enabled ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString()
    };
    saveReminderPreference(userId, preference);
    set({ preference: getReminderPreference(userId) });

    if (enabled) {
      await requestDailyReminderPermission(preference);
      Taro.showToast({
        title: '每日心约已保存。正式提醒能力将在后续版本接入。',
        icon: 'none',
        duration: 2500
      });
    } else {
      Taro.showToast({ title: '每日心约已关闭', icon: 'none' });
    }
  },

  clearPreference: () => {
    set({ preference: null, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  }
}));
