// AI对话服务 - NestJS 后端
import { Injectable } from '@nestjs/common';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

interface BaziContext {
  dayMaster?: string;
  yearPillar?: string;
  monthPillar?: string;
  dayPillar?: string;
  hourPillar?: string;
  favorableElements?: string[];
  personalityTags?: string[];
  summary?: string;
}

interface FortuneContext {
  overallScore?: number;
  moodKeyword?: string;
  yi?: string[];
  ji?: string[];
  luckyColor?: string;
  actionSuggestion?: string;
  summary?: string;
}

interface ChatInput {
  userId: string;
  question: string;
  bazi?: BaziContext;
  fortune?: FortuneContext;
  history?: Array<{ role: string; content: string }>;
}

interface ChatResult {
  content: string;
}

@Injectable()
export class ChatService {
  private llmClient: LLMClient;
  private config: Config;

  constructor() {
    this.config = new Config();
    this.llmClient = new LLMClient(this.config);
  }

  /**
   * 生成AI回复（接入真实LLM）
   */
  async generateChatResponse(input: ChatInput): Promise<ChatResult> {
    const { question, bazi, fortune, history } = input;

    // 构建系统提示
    const systemPrompt = `你是一个赛博风格的东方玄学 AI 陪伴者，名为"赛博灵频"。你的任务是：
1. 根据用户的八字命盘和今日运势，温柔地回答问题
2. 不使用绝对化、恐吓式表述，避免说"一定会"、"必定"等词
3. 以情绪陪伴和行动建议为主，给用户心理支持
4. 保持赛博东方的语言风格，可以适当使用"能量流动"、"频率校准"等词汇
5. 回复要简洁，控制在150字以内
6. 在回复末尾提醒"这只是娱乐参考，不是命运预测"`;

    // 构建用户上下文
    const baziInfo = bazi ? `
【用户八字信息】
- 年柱：${bazi.yearPillar || '未知'}
- 月柱：${bazi.monthPillar || '未知'}
- 日柱：${bazi.dayPillar || '未知'}
- 时柱：${bazi.hourPillar || '未知'}
- 日主：${bazi.dayMaster || '未知'}
- 性格特质：${bazi.personalityTags?.join('、') || '未知'}
- 喜用五行：${bazi.favorableElements?.join('、') || '未知'}
` : '';

    const fortuneInfo = fortune ? `
【今日运势】
- 综合分数：${fortune.overallScore || 50}分
- 情绪关键词：${fortune.moodKeyword || '平稳'}
- 宜：${fortune.yi?.join('、') || '无特别建议'}
- 忌：${fortune.ji?.join('、') || '无特别禁忌'}
- 幸运色：${fortune.luckyColor || '无'}
- 行动建议：${fortune.actionSuggestion || '顺其自然'}
` : '';

    // 构建对话历史
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    // 添加历史消息
    if (history && history.length > 0) {
      for (const msg of history) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content
        });
      }
    }

    // 添加当前问题（包含上下文）
    const userMessage = `${baziInfo}${fortuneInfo}
【用户问题】
${question}`;

    messages.push({ role: 'user', content: userMessage });

    console.log('[ChatService] 调用LLM，问题:', question);
    console.log('[ChatService] 上下文:', { bazi: bazi?.dayMaster, fortune: fortune?.overallScore });

    try {
      // 调用真实LLM
      const response = await this.llmClient.invoke(messages, {
        model: 'doubao-seed-2-0-lite-260215', // 使用轻量模型，快速响应
        temperature: 0.8, // 保持一定的创意性
      });

      console.log('[ChatService] LLM回复:', response.content?.slice(0, 100));

      return { content: response.content };
    } catch (error) {
      console.error('[ChatService] LLM调用失败:', error);

      // 兜底回复
      return {
        content: `我理解你的问题。基于你的命盘特点，建议保持觉知，顺应能量流动。记住，命运不是固定的剧本，你始终拥有选择的空间。这只是情绪陪伴，不是绝对的指导。`
      };
    }
  }
}