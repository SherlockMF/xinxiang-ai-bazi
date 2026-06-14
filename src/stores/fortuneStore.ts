// 运势状态管理 - fortuneStore
// 管理 DailyFortune 和收藏

import { create } from 'zustand';
import type { DailyFortune, FavoriteAdvice, BaziProfile } from '../types';
import { getDailyFortune, saveDailyFortune, getFavorites, saveFavorite, removeFavorite } from '../services/storageService';
import { generateDailyFortune, explainYiJi } from '../services/fortuneService';

interface FortuneState {
  // 今日运势
  todayFortune: DailyFortune | null;
  // 收藏列表
  favorites: FavoriteAdvice[];
  // 当前选中的宜忌解释
  currentExplanation: string | null;
  // 解释加载状态
  explanationLoading: boolean;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;
  
  // Actions
  // 加载今日运势
  loadTodayFortune: (userId: string, date: string) => void;
  // 生成今日运势
  generateTodayFortune: (bazi: BaziProfile, date: string) => Promise<DailyFortune>;
  // 设置今日运势
  setTodayFortune: (fortune: DailyFortune) => void;
  // 获取宜忌解释
  getYiJiExplanation: (bazi: BaziProfile, fortune: DailyFortune, item: string, type: 'yi' | 'ji') => Promise<string>;
  // 加载收藏列表
  loadFavorites: (userId: string) => void;
  // 添加收藏
  addFavorite: (favorite: FavoriteAdvice) => void;
  // 移除收藏
  removeFavorite: (userId: string, favoriteId: string) => void;
  // 清除所有收藏
  clearFavorites: () => void;
  // 清除解释
  clearExplanation: () => void;
  // 设置错误
  setError: (error: string | null) => void;
  // 设置加载状态
  setLoading: (loading: boolean) => void;
}

export const useFortuneStore = create<FortuneState>((set) => ({
  todayFortune: null,
  favorites: [],
  currentExplanation: null,
  explanationLoading: false,
  isLoading: false,
  error: null,
  
  loadTodayFortune: (userId: string, date: string) => {
    const fortune = getDailyFortune(userId, date);
    set({ todayFortune: fortune });
  },
  
  generateTodayFortune: async (bazi: BaziProfile, date: string): Promise<DailyFortune> => {
    set({ isLoading: true, error: null });
    
    try {
      const fortune = await generateDailyFortune(bazi, date);
      saveDailyFortune(fortune);
      set({ todayFortune: fortune, isLoading: false });
      return fortune;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : '生成运势失败';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },
  
  setTodayFortune: (fortune: DailyFortune) => {
    saveDailyFortune(fortune);
    set({ todayFortune: fortune });
  },
  
  getYiJiExplanation: async (bazi: BaziProfile, fortune: DailyFortune, item: string, type: 'yi' | 'ji'): Promise<string> => {
    set({ explanationLoading: true, currentExplanation: null });
    
    try {
      // 优先使用本地解释
      const localExplanation = await explainYiJi(bazi, fortune, item, type);
      
      // 如果本地解释可用，直接返回
      set({ currentExplanation: localExplanation, explanationLoading: false });
      return localExplanation;
      
      // TODO: 如果需要 LLM 解释，可以调用 llmProvider.explainYiJi
    } catch (error) {
      // 失败时返回兜底解释
      const fallbackExplanation = type === 'yi' 
        ? `"${item}"是基于你的五行特点给出的温柔建议，帮助你更好地感知今日的能量流动。记住，这只是娱乐参考，不是硬性规则。`
        : `"${item}"可能会消耗你今日的能量，如果遇到阻力不必焦虑。这只是能量场的自然调节，给自己多一点耐心就好。`;
      
      set({ currentExplanation: fallbackExplanation, explanationLoading: false });
      return fallbackExplanation;
    }
  },
  
  loadFavorites: (userId: string) => {
    const favorites = getFavorites(userId);
    set({ favorites });
  },
  
  addFavorite: (favorite: FavoriteAdvice) => {
    saveFavorite(favorite);
    const favorites = getFavorites(favorite.userId);
    set({ favorites });
  },
  
  removeFavorite: (userId: string, favoriteId: string) => {
    removeFavorite(userId, favoriteId);
    const favorites = getFavorites(userId);
    set({ favorites });
  },
  
  clearFavorites: () => {
    set({ favorites: [] });
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