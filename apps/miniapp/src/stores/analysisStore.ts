// 八字深度分析状态管理 - analysisStore
// 管理 AI 生成的命理深度分析报告

import { create } from 'zustand';
import type { UserProfile, BaziProfile, BaziAnalysisReport } from '../types';
import { getCachedAnalysis, generateBaziAnalysis } from '../services/analysisService';

interface AnalysisState {
  // 当前报告
  report: BaziAnalysisReport | null;
  // 加载状态
  isLoading: boolean;
  // 错误信息
  error: string | null;

  // Actions
  // 从本地缓存加载报告
  loadCachedReport: (userId: string) => void;
  // 生成报告（force=true 跳过缓存重新生成）
  generateReport: (user: UserProfile | null, bazi: BaziProfile, force?: boolean) => Promise<void>;
  // 清空当前报告
  clearReport: () => void;
}

export const useAnalysisStore = create<AnalysisState>((set) => ({
  report: null,
  isLoading: false,
  error: null,

  loadCachedReport: (userId: string) => {
    const cached = getCachedAnalysis(userId);
    set({ report: cached });
  },

  generateReport: async (user, bazi, force = false) => {
    set({ isLoading: true, error: null });
    try {
      const report = await generateBaziAnalysis(user, bazi, force);
      set({ report, isLoading: false });
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'AI 分析生成失败';
      set({ error: errorMsg, isLoading: false });
    }
  },

  clearReport: () => {
    set({ report: null, error: null });
  }
}));
