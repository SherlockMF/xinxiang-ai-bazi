// AI对话服务 - NestJS 后端
import { Injectable } from '@nestjs/common';

interface BaziContext {
  dayMaster?: string;
  favorableElements?: string[];
  personalityTags?: string[];
}

interface FortuneContext {
  overallScore?: number;
  moodKeyword?: string;
  yi?: string[];
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
  /**
   * 生成AI回复（MVP版本：使用模板）
   */
  generateChatResponse(input: ChatInput): ChatResult {
    const { question, bazi, fortune } = input;
    
    // MVP版本：使用预设模板回复
    // TODO: 接入真实 LLM API
    
    const fortuneScore = fortune?.overallScore ?? 50;
    const fortuneYi = fortune?.yi ?? [];
    const fortuneMood = fortune?.moodKeyword ?? '';
    const fortuneColor = fortune?.luckyColor ?? '';
    const fortuneAction = fortune?.actionSuggestion ?? '';
    const fortuneSummary = fortune?.summary ?? '';
    
    const baziDayMaster = bazi?.dayMaster ?? '';
    const baziFavorable = bazi?.favorableElements ?? [];
    const baziTags = bazi?.personalityTags ?? [];
    
    const templates: Record<string, string[]> = {
      '表白': [
        `基于你的命盘特点，今天表白需要在合适的能量状态下进行。${fortuneScore >= 75 ? '今日能量较高，是个表达心意的好时机。' : '今日能量稍低，建议先调整情绪状态。'}记住，这只是参考，真正的决定权在你自己手中。`,
        `八字显示你的感情能量今天${baziFavorable.includes('fire') ? '较为活跃' : '相对平稳'}。表白时保持真诚和自然即可。这只是娱乐参考，不是命运预测。`
      ],
      '工作': [
        `今日工作运势显示，${fortuneYi.length > 0 ? `宜 ${fortuneYi.join('、')}` : '保持专注'}。建议在工作中保持冷静，遇到问题多思考。这只是情绪陪伴，不是决策依据。`,
        `你的五行特质适合需要${baziTags.length > 0 ? baziTags[0] : '专注'}的工作。今天工作可以发挥这个特点。记住，这仅供参考。`
      ],
      '情绪': [
        `情绪波动是能量场的自然调节。${fortuneMood ? `今日关键词是 ${fortuneMood}` : '建议给自己一点时间'}。可以通过${fortuneColor ? `穿着 ${fortuneColor}` : '静心冥想'}来调整状态。这只是陪伴建议。`,
        `低落时可以尝试今日行动建议：${fortuneAction || '给自己一点独处时间'}。记住，能量会流动，低谷是暂时的。这不是预测，是陪伴。`
      ],
      'default': [
        `我理解你的问题。基于你的命盘和今日运势，建议保持觉知、顺应流、不要过度用力。命运不是固定剧本，你始终拥有选择空间。这只是情绪陪伴，不是绝对指导。`,
        `根据你的八字特点${baziDayMaster ? `（日主 ${baziDayMaster}）` : ''}，建议今天保持平和心态。这只是一次频率校准，不是命运预言。`,
        `你的问题值得认真思考。${fortuneSummary || '今日能量流动平稳'}。记住，所有建议仅供娱乐参考，真正的答案在你心中。`
      ]
    };
    
    // 根据问题关键词选择模板
    let pool = templates['default'];
    if (question.includes('表白')) {
      pool = templates['表白'];
    } else if (question.includes('工作')) {
      pool = templates['工作'];
    } else if (question.includes('情绪') || question.includes('低') || question.includes('难过')) {
      pool = templates['情绪'];
    }
    
    const content = pool[Math.floor(Math.random() * pool.length)];
    
    return { content };
  }
}