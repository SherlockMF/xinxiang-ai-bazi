// 运势生成控制器 - NestJS 后端
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { FortuneService } from './fortune.service';

interface GenerateFortuneDto {
  userId: string;
  date: string;
  bazi: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    dayMaster: string;
    fiveElements: Record<string, number>;
    favorableElements: string[];
    personalityTags: string[];
  };
}

@Controller('fortune')
export class FortuneController {
  constructor(private readonly fortuneService: FortuneService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateFortune(@Body() body: GenerateFortuneDto) {
    console.log('[FortuneController] 接收到运势生成请求:', {
      hasUserId: !!body?.userId,
      hasDate: !!body?.date,
      hasBazi: !!body?.bazi,
      hasDayMaster: !!body?.bazi?.dayMaster,
      favorableElementCount: body?.bazi?.favorableElements?.length ?? 0
    });
    
    const { userId, date, bazi } = body;
    
    // 校验必填参数
    if (!userId || !date || !bazi) {
      return {
        code: 400,
        msg: '缺少必填参数：userId, date 或 bazi',
        data: null
      };
    }

    try {
      const result = this.fortuneService.generateFortune(bazi, date);
      
      const fortuneProfile = {
        id: `fortune_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId,
        date,
        ...result,
        createdAt: new Date().toISOString()
      };

      console.log('[FortuneController] 运势生成成功:', {
        id: fortuneProfile.id,
        hasUserId: !!fortuneProfile.userId,
        date: fortuneProfile.date,
        yiCount: fortuneProfile.yi?.length ?? 0,
        jiCount: fortuneProfile.ji?.length ?? 0
      });

      return {
        code: 200,
        msg: 'success',
        data: fortuneProfile
      };
    } catch (error) {
      console.error('[FortuneController] 运势生成失败:', error);
      return {
        code: 500,
        msg: error instanceof Error ? error.message : '运势生成失败',
        data: null
      };
    }
  }
}
