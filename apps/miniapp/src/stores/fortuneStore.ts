// 运势状态管理 - fortuneStore

import { create } from 'zustand';
import type { DailyFortune, FavoriteItem, BaziProfile, UserProfile } from '../types';
import { getDailyFortune, saveDailyFortune, removeFavorite } from '../services/storageService';
import { getFavoriteItems, addFavoriteItem, type AddFavoriteResult } from '../services/favoriteService';
import { generateDailyFortune, explainYiJi } from '../services/fortuneService';

interface FortuneState {
  todayFortune: DailyFortune | null;
  favorites: FavoriteItem[];
  currentExplanation: string | null;
  explanationLoading: boolean;
  isLoading: boolean;
  error: string | null;

  loadTodayFortune: (userProfile: UserProfile, date: string) => void;
  generateTodayFortune: (bazi: BaziProfile, userProfile: UserProfile, date: string, force?: boolean) => Promise<DailyFortune>;
  setTodayFortune: (fortune: DailyFortune, userProfile: UserProfile) => void;
  getYiJiExplanation: (bazi: BaziProfile, userProfile: UserProfile, fortune: DailyFortune, item: string, type: 'yi' | 'ji') => Promise<string>;
  loadFavorites: (userId: string) => void;
  addFavorite: (favorite: FavoriteItem) => AddFavoriteResult;
  removeFavorite: (userId: string, favoriteId: string) => void;
  clearFavorites: () => void;
  clearTodayFortune: () => void;
  clearExplanation: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

function resolveTimeBranch(userProfile: UserProfile): string {
  if (userProfile.unknownTime) return 'unknown';
  return userProfile.timeBranch || 'unknown';
}

export const useFortuneStore = create<FortuneState>((set) => ({
  todayFortune: null,
  favorites: [],
  currentExplanation: null,
  explanationLoading: false,
  isLoading: false,
  error: null,

  loadTodayFortune: (userProfile: UserProfile, date: string) => {
    const timeBranch = resolveTimeBranch(userProfile);
    const fortune = getDailyFortune(
      userProfile.id,
      date,
      userProfile.birthDate,
      timeBranch
    );
    set({ todayFortune: fortune });
  },

  generateTodayFortune: async (bazi, userProfile, date, force = false): Promise<DailyFortune> => {
    set({ isLoading: true, error: null });
    try {
      const fortune = await generateDailyFortune(bazi, userProfile, date, force);
      const timeBranch = resolveTimeBranch(userProfile);
      saveDailyFortune(fortune, userProfile.birthDate, timeBranch);
      set({ todayFortune: fortune, isLoading: false });
      return fortune;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成心象失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  setTodayFortune: (fortune, userProfile) => {
    const timeBranch = resolveTimeBranch(userProfile);
    saveDailyFortune(fortune, userProfile.birthDate, timeBranch);
    set({ todayFortune: fortune });
  },

  getYiJiExplanation: async (bazi, userProfile, fortune, item, type): Promise<string> => {
    set({ explanationLoading: true, currentExplanation: null });
    try {
      const localExplanation = await explainYiJi(bazi, fortune, item, type, userProfile);
      set({ currentExplanation: localExplanation, explanationLoading: false });
      return localExplanation;
    } catch {
      const fallbackExplanation = type === 'yi'
        ? `"${item}"是基于你的五行特点给出的温柔建议，帮助你更好地感知今日的能量流动。记住，这只是自我观察参考，不是硬性规则。`
        : `"${item}"可能会消耗你今日的能量，如果遇到阻力不必焦虑。给自己多一点耐心就好。`;
      set({ currentExplanation: fallbackExplanation, explanationLoading: false });
      return fallbackExplanation;
    }
  },

  loadFavorites: (userId: string) => {
    set({ favorites: getFavoriteItems(userId) });
  },

  addFavorite: (favorite: FavoriteItem): AddFavoriteResult => {
    const result = addFavoriteItem(favorite);
    if (result === 'added') {
      set({ favorites: getFavoriteItems(favorite.userId) });
    }
    return result;
  },

  removeFavorite: (userId: string, favoriteId: string) => {
    removeFavorite(userId, favoriteId);
    set({ favorites: getFavoriteItems(userId) });
  },

  clearFavorites: () => {
    set({ favorites: [] });
  },

  clearTodayFortune: () => {
    set({ todayFortune: null, currentExplanation: null });
  },

  clearExplanation: () => {
    set({ currentExplanation: null });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  }
}));
