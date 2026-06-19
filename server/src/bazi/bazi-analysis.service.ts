// 八字深度分析服务 - 接入 LLM 生成完整命理分析
import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';
import { buildAnalysisMessages, AnalysisInput } from './bazi-analysis.prompt';

interface AnalysisResult {
  content: string;
}

// 深度分析用模型（与 chat 复用同一可用模型，确保运行环境一致）
const ANALYSIS_MODEL = 'doubao-seed-2-0-lite-260215';

@Injectable()
export class BaziAnalysisService {
  private llmClient: LLMClient;
  private config: Config;

  constructor() {
    this.config = new Config();
    this.llmClient = new LLMClient(this.config);
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

    const response = await this.llmClient.invoke(messages, {
      model: ANALYSIS_MODEL,
      temperature: 0.7 // 分析类降低随机性，保证条理
    });

    console.log('[BaziAnalysisService] 分析生成成功，长度:', response.content?.length ?? 0);

    return { content: response.content };
  }
}
