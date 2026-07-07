// 八字深度分析服务 - analysisService
// 调用后端 /api/bazi/analyze 生成 AI 完整命理分析，并在本地缓存。

import type { UserProfile, BaziProfile, BaziAnalysisReport } from '../types';
import { getElementLabel } from '../types';
import { Network } from '../network';
import { storage } from './storageAdapter';
import { STORAGE_KEYS, migrateStorageKeysIfNeeded } from './storageService';

/**
 * 读取缓存的深度分析
 */
export function getCachedAnalysis(userId: string): BaziAnalysisReport | null {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.BAZI_ANALYSIS);
    if (!cache) return null;
    const parsed = JSON.parse(cache) as Record<string, BaziAnalysisReport>;
    return parsed[userId] || null;
  } catch {
    return null;
  }
}

/**
 * 缓存深度分析
 */
export function cacheAnalysis(report: BaziAnalysisReport): void {
  try {
    migrateStorageKeysIfNeeded();
    const cache = storage.getItem(STORAGE_KEYS.BAZI_ANALYSIS) || '{}';
    const parsed = JSON.parse(cache) as Record<string, BaziAnalysisReport>;
    parsed[report.userId] = report;
    storage.setItem(STORAGE_KEYS.BAZI_ANALYSIS, JSON.stringify(parsed));
  } catch {
    // 缓存失败不影响主流程
  }
}

/**
 * 生成八字深度分析
 * @param force 为 true 时跳过缓存，强制重新请求并覆盖缓存
 */
export async function generateBaziAnalysis(
  user: UserProfile | null,
  bazi: BaziProfile,
  force = false
): Promise<BaziAnalysisReport> {
  // 默认读取缓存
  if (!force) {
    const cached = getCachedAnalysis(bazi.userId);
    if (cached) {
      return cached;
    }
  }

  const currentDate = new Date().toISOString().slice(0, 10);

  const response = await Network.request({
    url: '/api/bazi/analyze',
    method: 'POST',
    data: {
      userId: bazi.userId,
      gender: user?.gender,
      birthDate: user?.birthDate,
      birthTime: user?.birthTime,
      birthPlace: user?.birthPlace,
      calendarType: user?.calendarType,
      currentDate,
      bazi: {
        yearPillar: bazi.yearPillar,
        monthPillar: bazi.monthPillar,
        dayPillar: bazi.dayPillar,
        hourPillar: bazi.hourPillar,
        dayMaster: bazi.dayMaster,
        fiveElements: bazi.fiveElements,
        // 内部为英文枚举，发送给服务端/LLM 时转中文
        favorableElements: bazi.favorableElements.map(getElementLabel),
        personalityTags: bazi.personalityTags,
        summary: bazi.summary
      }
    }
  });

  // 兼容拦截器的双层 data 结构
  const content: string | undefined =
    response?.data?.data?.content || response?.data?.content;

  if (!content) {
    throw new Error('AI 分析内容为空');
  }

  const report: BaziAnalysisReport = {
    userId: bazi.userId,
    content,
    createdAt: new Date().toISOString()
  };

  cacheAnalysis(report);
  return report;
}
