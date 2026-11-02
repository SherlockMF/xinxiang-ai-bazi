// 此刻心象服务 - momentService
// 把「此刻」流时四柱 + 本命四柱发送至后端 /api/bazi/moment，由 LLM 生成此刻深度解读。
// 与深度命理分析同样的容错策略：失败时抛错，由调用方走兜底。

import type { BaziProfile } from '../types/index.ts';
import { getElementLabel } from '../types/index.ts';
import type { MomentPillars } from './bazi-service.ts';
import { Network } from '../network.ts';

/**
 * 生成「此刻」深度解读
 * @param bazi 本命八字档案
 * @param moment 此刻排出的流时四柱
 * @param momentTime 此刻时间字符串（如 2026-06-27 15:24）
 */
export async function generateMomentAnalysis(
  bazi: BaziProfile,
  moment: MomentPillars,
  momentTime: string
): Promise<string> {
  const response = await Network.request({
    url: '/api/bazi/moment',
    method: 'POST',
    data: {
      userId: bazi.userId,
      momentTime,
      moment,
      natal: {
        yearPillar: bazi.yearPillar,
        monthPillar: bazi.monthPillar,
        dayPillar: bazi.dayPillar,
        hourPillar: bazi.hourPillar,
        dayMaster: bazi.dayMaster,
        // 内部英文枚举，发送给服务端 / LLM 时转中文
        favorableElements: bazi.favorableElements.map(getElementLabel),
        personalityTags: bazi.personalityTags,
        summary: bazi.summary
      }
    }
  });

  // 兼容拦截器的双层 data 结构
  const content: string | undefined = response?.data?.data?.content || response?.data?.content;

  if (!content) {
    throw new Error('此刻解读内容为空');
  }

  return content;
}
