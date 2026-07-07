// 用户状态管理 - userStore
// 多命主：管理命主列表 + 当前命主；userProfile / baziProfile 始终指向「当前命主」，
// 下游页面无需改动即可随切换联动。

import { create } from 'zustand';
import type { UserProfile, BaziProfile } from '../types';
import {
  getProfiles,
  upsertProfile,
  getActiveProfileId,
  setActiveProfileId,
  getBaziByUser,
  saveBaziForUser,
  removeProfileData,
  migrateLegacyProfileIfNeeded,
  migrateStorageKeysIfNeeded,
  clearDailyCacheForUser,
  savePrivacyAccepted,
  clearAllData
} from '../services/storageService';
import { clearDailyHistoryForUser } from '../services/historyService';
import { clearVisitStatsForUser } from '../services/visitStatsService';
import { normalizeUserProfile } from '../services/birthUtils';
import { generateBaziProfile } from '../services/baziService';

interface UserState {
  // 命主列表
  profiles: UserProfile[];
  // 当前命主 id
  activeId: string | null;
  // 当前命主档案
  userProfile: UserProfile | null;
  // 当前命主八字
  baziProfile: BaziProfile | null;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;

  // Actions
  // 加载（迁移旧数据 + 读取列表与当前命主）
  loadUserProfile: () => void;
  // 新增一位命主并排盘，设为当前命主
  addProfile: (profile: UserProfile) => Promise<BaziProfile>;
  // 更新当前命主出生信息（修改后清今日心象缓存并重新排盘）
  updateActiveProfile: (profile: UserProfile) => Promise<BaziProfile>;
  // 切换当前命主
  switchProfile: (id: string) => void;
  // 删除一位命主及其全部数据
  removeProfile: (id: string) => void;
  // 更新当前命主八字
  setBaziProfile: (bazi: BaziProfile) => void;
  // 清除所有数据
  clearAll: () => void;
  // 设置错误 / 加载
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// 从存储恢复「当前命主」的档案与八字
function resolveActive(profiles: UserProfile[], activeId: string | null) {
  const active = profiles.find(p => p.id === activeId) || profiles[0] || null;
  const bazi = active ? getBaziByUser(active.id) : null;
  return { active, bazi, activeId: active?.id || null };
}

export const useUserStore = create<UserState>((set) => ({
  profiles: [],
  activeId: null,
  userProfile: null,
  baziProfile: null,
  isLoading: false,
  error: null,

  loadUserProfile: () => {
    migrateStorageKeysIfNeeded();
    migrateLegacyProfileIfNeeded();
    const profiles = getProfiles();
    const { active, bazi, activeId } = resolveActive(profiles, getActiveProfileId());
    if (activeId) setActiveProfileId(activeId);
    set({ profiles, activeId, userProfile: active, baziProfile: bazi });
  },

  addProfile: async (profile: UserProfile): Promise<BaziProfile> => {
    set({ isLoading: true, error: null });
    try {
      const normalized = normalizeUserProfile(profile);
      upsertProfile(normalized);
      if (normalized.privacyAccepted && normalized.privacyAcceptedAt) {
        savePrivacyAccepted(normalized.id, normalized.privacyAcceptedAt);
      }
      setActiveProfileId(normalized.id);
      const bazi = await generateBaziProfile(normalized);
      saveBaziForUser(bazi);
      set({
        profiles: getProfiles(),
        activeId: normalized.id,
        userProfile: normalized,
        baziProfile: bazi,
        isLoading: false
      });
      return bazi;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '排盘失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  updateActiveProfile: async (profile: UserProfile): Promise<BaziProfile> => {
    set({ isLoading: true, error: null });
    try {
      const normalized = normalizeUserProfile(profile);
      const prev = getProfiles().find(p => p.id === normalized.id);
      const birthChanged = !prev || (
        prev.birthDate !== normalized.birthDate ||
        prev.birthTime !== normalized.birthTime ||
        prev.unknownTime !== normalized.unknownTime ||
        prev.timeBranch !== normalized.timeBranch
      );

      if (birthChanged) {
        clearDailyCacheForUser(normalized.id);
        clearDailyHistoryForUser(normalized.id);
        clearVisitStatsForUser(normalized.id);
      }

      upsertProfile(normalized);
      if (normalized.privacyAccepted && normalized.privacyAcceptedAt) {
        savePrivacyAccepted(normalized.id, normalized.privacyAcceptedAt);
      }
      setActiveProfileId(normalized.id);

      const bazi = birthChanged
        ? await generateBaziProfile(normalized)
        : (getBaziByUser(normalized.id) || await generateBaziProfile(normalized));
      saveBaziForUser(bazi);

      set({
        profiles: getProfiles(),
        activeId: normalized.id,
        userProfile: normalized,
        baziProfile: bazi,
        isLoading: false
      });
      return bazi;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '更新失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  switchProfile: (id: string) => {
    const profiles = getProfiles();
    const active = profiles.find(p => p.id === id);
    if (!active) return;
    setActiveProfileId(id);
    set({
      activeId: id,
      userProfile: active,
      baziProfile: getBaziByUser(id),
      profiles
    });
  },

  removeProfile: (id: string) => {
    removeProfileData(id);
    const profiles = getProfiles();
    const { active, bazi, activeId } = resolveActive(profiles, getActiveProfileId());
    if (activeId) setActiveProfileId(activeId);
    set({ profiles, activeId, userProfile: active, baziProfile: bazi });
  },

  setBaziProfile: (bazi: BaziProfile) => {
    saveBaziForUser(bazi);
    set({ baziProfile: bazi });
  },

  clearAll: () => {
    clearAllData();
    set({ profiles: [], activeId: null, userProfile: null, baziProfile: null, error: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));
