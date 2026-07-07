// AI 问心控制器 - NestJS 后端

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import type { AskRequest, AskResponse } from './ask.types';
import { GENERAL_FALLBACK_ANSWER } from './ask-answer.parser';

const MAX_QUESTION_LENGTH = 200;

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async chatMessage(@Body() body: AskRequest) {
    const userId = body.userId || 'local';
    const question = (body.question || '').trim();

    console.log('[ChatController] 接收到问心请求:', {
      hasUserId: !!body.userId,
      questionLength: question.length,
      questionType: body.questionType,
      hasBaziLite: !!(body.baziLite || body.bazi),
      hasDailyXiang: !!(body.dailyXiang || body.fortune),
      historyLength: body.history?.length ?? 0
    });

    if (!question) {
      return {
        code: 400,
        msg: '问题不能为空',
        data: null
      };
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return {
        code: 400,
        msg: `问题不能超过 ${MAX_QUESTION_LENGTH} 字`,
        data: null
      };
    }

    try {
      const result = await this.chatService.generateChatResponse({
        ...body,
        userId,
        question
      });

      const message: AskResponse = {
        id: `msg_${Date.now()}_ai`,
        userId,
        role: 'assistant',
        content: result.content,
        answer: result.answer,
        createdAt: new Date().toISOString()
      };

      console.log('[ChatController] 问心回应生成成功:', {
        id: message.id,
        source: message.answer.source,
        riskLevel: message.answer.riskLevel
      });

      return {
        code: 200,
        msg: 'success',
        data: message
      };
    } catch (error) {
      console.error('[ChatController] 问心回应生成失败:', error);

      const fallback = { ...GENERAL_FALLBACK_ANSWER, source: 'fallback' as const };
      const message: AskResponse = {
        id: `msg_${Date.now()}_ai_fallback`,
        userId,
        role: 'assistant',
        content: fallback.title,
        answer: fallback,
        createdAt: new Date().toISOString()
      };

      return {
        code: 200,
        msg: 'success',
        data: message
      };
    }
  }
}
