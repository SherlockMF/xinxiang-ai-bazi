// LLM Provider - 可替换的大语言模型调用层
// 支持 Doubao、DeepSeek、Kimi、OpenAI 等模型

import type { LLMConfig, LLMResponse } from '../types';

// 默认配置（开发环境使用 mock）
const DEFAULT_CONFIG: LLMConfig = {
  provider: 'doubao',
  model: 'doubao-pro-32k'
};

/**
 * LLM Provider 类
 * 封装不同模型的调用逻辑
 */
class LLMProvider {
  private config: LLMConfig;

  constructor(config: LLMConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 调用 LLM（MVP 版本：mock 实现）
   * 后续接入真实 API
   */
  async chat(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    console.log('[LLMProvider] 调用模型:', this.config.provider);
    console.log('[LLMProvider] Prompt:', prompt.slice(0, 200));
    
    // MVP 版本：返回 mock 数据
    // TODO: 接入真实 LLM API
    return this.mockChat(prompt, systemPrompt);
  }

  /**
   * Mock 调用（开发阶段使用）
   */
  private async mockChat(prompt: string, _systemPrompt?: string): Promise<LLMResponse> {
    // 模拟延迟
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 根据 prompt 类型返回不同 mock 数据
    if (prompt.includes('运势') || prompt.includes('今日')) {
      return {
        content: `这是一个关于运势的 AI 回复。基于你的命盘特点，今天适合保持平和的心态，顺应能量流动。记住，这只是情绪陪伴，不是命运预测。`,
        raw: { mock: true }
      };
    }
    
    if (prompt.includes('解释') || prompt.includes('宜忌')) {
      return {
        content: `这个建议是基于你的五行特点生成的。它不是硬性规则，而是帮助你更好地感知今日能量状态的温柔提示。保持轻松心态，顺势而为就好。`,
        raw: { mock: true }
      };
    }
    
    return {
      content: `我理解你的问题。基于你的命盘和今日运势，我的建议是：保持觉知，顺应流，不要过度用力。记住，命运不是固定的剧本，你始终拥有选择的空间。这只是情绪陪伴，不是绝对的指导。`,
      raw: { mock: true }
    };
  }

  /**
   * 生成八字档案摘要（通过 LLM）
   */
  async generateBaziSummary(baziData: Record<string, unknown>): Promise<string> {
    const prompt = `请根据以下八字信息，生成一段 100 字以内的命盘摘要。
八字信息：${JSON.stringify(baziData)}
要求：
1. 语气温柔、陪伴感
2. 不使用绝对化表述
3. 突出性格特质和能量倾向
4. 结尾加上"这只是娱乐参考，不是命运预测"`;
    
    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * 解释宜忌（通过 LLM）
   */
  async explainYiJi(
    bazi: Record<string, unknown>,
    fortune: Record<string, unknown>,
    item: string,
    type: 'yi' | 'ji'
  ): Promise<string> {
    const prompt = `请解释为什么"${item}"是今日${type === 'yi' ? '宜' : '忌'}。
用户八字：${JSON.stringify(bazi)}
今日运势：${JSON.stringify(fortune)}
要求：
1. 100 字以内
2. 语气温柔、陪伴感
3. 不使用绝对化表述
4. 强调顺势而为、不是硬性规则`;
    
    const response = await this.chat(prompt);
    return response.content;
  }

  /**
   * AI 对话（追问）
   */
  async chatWithContext(
    question: string,
    bazi: Record<string, unknown>,
    fortune: Record<string, unknown>,
    history: Array<{ role: string; content: string }>
  ): Promise<string> {
    const systemPrompt = `你是一个赛博风格的东方玄学 AI 陪伴者。你的任务是：
1. 根据用户的八字和运势，温柔地回答问题
2. 不使用绝对化、恐吓式表述
3. 以情绪陪伴和行动建议为主
4. 在回复末尾提醒"这只是娱乐参考"
5. 保持赛博东方的语言风格`;

    const historyText = history.map(h => `${h.role}: ${h.content}`).join('\n');
    const prompt = `用户八字：${JSON.stringify(bazi)}
今日运势：${JSON.stringify(fortune)}
对话历史：${historyText}
用户问题：${question}`;

    const response = await this.chat(prompt, systemPrompt);
    return response.content;
  }
}

// 导出单例
export const llmProvider = new LLMProvider();

// 导出类供自定义配置
export { LLMProvider };