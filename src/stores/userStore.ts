// 用户状态管理 - userStore
// 管理 UserProfile 和 BaziProfile

import { create } from 'zustand';
import type { UserProfile, BaziProfile } from '../types';
import { getUserProfile, saveUserProfile, getBaziProfile, saveBaziProfile, clearUserProfile, clearBaziProfile } from '../services/storageService';
import { generateBaziProfile } from '../services/baziService';

interface UserState {
  // 用户档案
  userProfile: UserProfile | null;
  // 八字档案
  baziProfile: BaziProfile | null;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
  
  // Actions
  // 加载用户档案
  loadUserProfile: () => void;
  // 设置用户档案
  setUserProfile: (profile: UserProfile) => void;
  // 生成八字档案
  generateBazi: (profile: UserProfile) => Promise<BaziProfile>;
  // 更新八字档案
  setBaziProfile: (bazi: BaziProfile) => void;
  // 清除所有数据
  clearAll: () => void;
  // 设置错误
  setError: (error: string | null) => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  userProfile: null,
  baziProfile: null,
  isLoading: false,
  error: null,
  
  loadUserProfile: () => {
    const profile = getUserProfile();
    const bazi = getBaziProfile();
    set({ userProfile: profile, baziProfile: bazi });
  },
  
  setUserProfile: (profile: UserProfile) => {
    saveUserProfile(profile);
    set({ userProfile: profile });
  },
  
  generateBazi: async (profile: UserProfile): Promise<BaziProfile> => {
    set({ isLoading: true, error: null });
    
    try {
      const bazi = await generateBaziProfile(profile);
      saveBaziProfile(bazi);
      set({ baziProfile: bazi, isLoading: false });
      return bazi;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成八字档案失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
  
  setBaziProfile: (bazi: BaziProfile) => {
    saveBaziProfile(bazi);
    set({ baziProfile: bazi });
  },
  
  clearAll: () => {
    clearUserProfile();
    clearBaziProfile();
    set({ userProfile: null, baziProfile: null, error: null });
  },
  
  setError: (error: string | null) => {
    set({ error });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));