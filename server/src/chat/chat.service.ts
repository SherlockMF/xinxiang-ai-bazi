// AI 问心服务 - NestJS 后端

import { Injectable } from '@nestjs/common';
import { ZhipuClient } from '../llm/zhipu.client';
import type { AskAnswer, AskRequest, BaziLite, DailyXiangLite } from './ask.types';
import { detectQuestionRisk } from './risk-detection';
import {
  buildAnswerContent,
  GENERAL_FALLBACK_ANSWER,
  parseAskAnswer,
  SAFETY_FALLBACK_ANSWER
} from './ask-answer.parser';
import { buildAskSystemPrompt, buildAskUserPrompt } from './chat.prompt';

const MAX_QUESTION_LENGTH = 200;

@Injectable()
export class ChatService {
  private llmClient: ZhipuClient;

  constructor() {
    this.llmClient = new ZhipuClient();
  }

  private normalizeInput(input: AskRequest): {
    question: string;
    baziLite?: BaziLite;
    dailyXiang?: DailyXiangLite;
    questionType: AskRequest['questionType'];
    history?: AskRequest['history'];
  } {
    const question = (input.question || '').trim().slice(0, MAX_QUESTION_LENGTH);
    const baziLite = input.baziLite || input.bazi;
    const dailyXiang = input.dailyXiang || input.fortune;
    return {
      question,
      baziLite,
      dailyXiang,
      questionType: input.questionType || 'general',
      history: input.history
    };
  }

  private hasApiKey(): boolean {
    return !!(process.env.ZHIPU_API_KEY && process.env.ZHIPU_API_KEY.trim());
  }

  /**
   * 生成结构化心象回应
   */
  async generateChatResponse(input: AskRequest): Promise<{ content: string; answer: AskAnswer }> {
    const { question, baziLite, dailyXiang, questionType, history } = this.normalizeInput(input);

    if (!question) {
      return {
        content: GENERAL_FALLBACK_ANSWER.title,
        answer: { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' }
      };
    }

    const risk = detectQuestionRisk(question);
    if (risk.riskLevel === 'high') {
      return {
        content: SAFETY_FALLBACK_ANSWER.title,
        answer: { ...SAFETY_FALLBACK_ANSWER }
      };
    }

    if (!this.hasApiKey()) {
      console.warn('[ChatService] 未配置 ZHIPU_API_KEY，使用 fallback');
      return {
        content: GENERAL_FALLBACK_ANSWER.title,
        answer: { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' }
      };
    }

    const relationshipMedium = risk.riskLevel === 'medium' && risk.reason === 'relationship';
    const systemPrompt = buildAskSystemPrompt(relationshipMedium);
    const userPrompt = buildAskUserPrompt(
      question,
      questionType || 'general',
      baziLite,
      dailyXiang
    );

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt }
    ];

    if (history && history.length > 0) {
      for (const msg of history.slice(-6)) {
        messages.push({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content.slice(0, 200)
        });
      }
    }

    messages.push({ role: 'user', content: userPrompt });

    console.log('[ChatService] 调用LLM:', {
      questionLength: question.length,
      questionType,
      riskLevel: risk.riskLevel,
      hasBazi: !!baziLite,
      hasDailyXiang: !!dailyXiang,
      historyLength: history?.length ?? 0
    });

    try {
      const response = await this.llmClient.invoke(messages, {
        temperature: 0.7,
        maxTokens: 800
      });

      const answer = parseAskAnswer(response.content || '', 'ai');
      return {
        content: buildAnswerContent(answer),
        answer
      };
    } catch (error) {
      console.error('[ChatService] LLM调用失败:', error);
      return {
        content: GENERAL_FALLBACK_ANSWER.title,
        answer: { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' }
      };
    }
  }
}
