// 八字深度分析服务 - 接入 LLM 生成完整命理分析
import { Injectable } from '@nestjs/common';
import { ZhipuClient } from '../llm/zhipu.client';
import { buildAnalysisMessages, AnalysisInput, buildMomentMessages, MomentInput } from './bazi-analysis.prompt';

interface AnalysisResult {
  content: string;
}

// 深度分析用模型：可单独用 ZHIPU_ANALYSIS_MODEL 指定更强模型（如 glm-4.6 / glm-4.6v），
// 否则回退到通用 ZHIPU_MODEL，再回退 glm-4.5-air。
const ANALYSIS_MODEL = process.env.ZHIPU_ANALYSIS_MODEL || process.env.ZHIPU_MODEL || 'glm-4.5-air';

// 判定 LLM 输出是否为「异常/拒答」（轻量模型偶发：说乱码、要求补充信息、过短、缺小标题）
function looksInvalid(content: string): boolean {
  if (!content || content.length < 200) return true;
  if (/乱码|无法识别|信息不完整|缺少.*(信息|时间)|请.*(补充|提供).*信息|期待您的补充/.test(content)) return true;
  // 正常分析应含多个 ## 小标题
  const headings = content.match(/##/g);
  if (!headings || headings.length < 3) return true;
  return false;
}

@Injectable()
export class BaziAnalysisService {
  private llmClient: ZhipuClient;

  constructor() {
    this.llmClient = new ZhipuClient();
  }

  /**
   * 生成八字深度分析（基于已排四柱）
   */
  async generateAnalysis(input: AnalysisInput): Promise<AnalysisResult> {
    const messages = buildAnalysisMessages(input);

    // 隐私：仅打印非敏感元信息
    console.log('[BaziAnalysisService] 生成深度分析:', {
      hasDayMaster: !!input.bazi?.dayMaster,
      hasHourPillar: !!(input.bazi?.hourPillar && input.bazi.hourPillar.trim()),
      gender: input.gender || 'unknown'
    });

    // 轻量模型偶发拒答/乱码，做最多 2 次尝试，取首个有效输出
    let content = '';
    for (let attempt = 1; attempt <= 2; attempt++) {
      const response = await this.llmClient.invoke(messages, {
        model: ANALYSIS_MODEL,
        temperature: 0.6, // 降低随机性，减少偶发拒答
        maxTokens: 8192 // 长文给足额度避免截断
      });
      content = response.content;
      if (!looksInvalid(content)) {
        console.log('[BaziAnalysisService] 分析生成成功，长度:', content.length, `（第${attempt}次）`);
        return { content };
      }
      console.warn(`[BaziAnalysisService] 第${attempt}次输出疑似异常（拒答/乱码/过短），${attempt < 2 ? '重试' : '返回兜底'}`);
    }
    // 两次都异常：返回最后一次内容，交由前端展示（仍带兜底说明）
    return { content };
  }

  /**
   * 生成「此刻心象」解读（流时四柱 × 本命）
   */
  async generateMomentAnalysis(input: MomentInput): Promise<AnalysisResult> {
    const messages = buildMomentMessages(input);

    console.log('[BaziAnalysisService] 生成此刻解读:', {
      momentTime: input.momentTime || 'unknown',
      hasNatalDayMaster: !!input.natal?.dayMaster
    });

    const response = await this.llmClient.invoke(messages, {
      model: ANALYSIS_MODEL,
      temperature: 0.8 // 此刻解读偏感性，略放开
    });

    console.log('[BaziAnalysisService] 此刻解读成功，长度:', response.content?.length ?? 0);

    return { content: response.content };
  }
}
