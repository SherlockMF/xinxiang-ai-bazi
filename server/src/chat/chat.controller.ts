// AI对话控制器 - NestJS 后端
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';

interface ChatDto {
  userId: string;
  question: string;
  bazi?: Record<string, unknown>;
  fortune?: Record<string, unknown>;
  history?: Array<{ role: string; content: string }>;
}

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @HttpCode(HttpStatus.OK)
  async chatMessage(@Body() body: ChatDto) {
    const { userId, question, bazi, fortune, history } = body;

    // 隐私：仅打印非敏感的元信息，不记录用户问题 / 八字 / 运势等内容
    console.log('[ChatController] 接收到AI对话请求:', {
      hasUserId: !!userId,
      questionLength: question?.length ?? 0,
      hasBazi: !!bazi,
      hasFortune: !!fortune,
      historyLength: history?.length ?? 0
    });
    
    // 校验必填参数
    if (!userId || !question) {
      return {
        code: 400,
        msg: '缺少必填参数：userId 或 question',
        data: null
      };
    }

    try {
      const result = await this.chatService.generateChatResponse({
        userId,
        question,
        bazi,
        fortune,
        history
      });
      
      const message = {
        id: `msg_${Date.now()}_ai`,
        userId,
        role: 'assistant',
        content: result.content,
        createdAt: new Date().toISOString()
      };

      // 隐私：仅打印生成结果的元信息，不记录回复正文
      console.log('[ChatController] AI回复生成成功:', {
        id: message.id,
        contentLength: message.content?.length ?? 0
      });

      return {
        code: 200,
        msg: 'success',
        data: message
      };
    } catch (error) {
      console.error('[ChatController] AI回复生成失败:', error);
      return {
        code: 500,
        msg: error instanceof Error ? error.message : 'AI回复生成失败',
        data: null
      };
    }
  }
}