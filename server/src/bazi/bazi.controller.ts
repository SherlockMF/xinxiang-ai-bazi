// 八字生成控制器 - NestJS 后端
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BaziService } from './bazi.service';

interface GenerateBaziDto {
  birthDate: string;
  birthTime: string;
  userId?: string;
}

@Controller('bazi')
export class BaziController {
  constructor(private readonly baziService: BaziService) {}

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  generateBazi(@Body() body: GenerateBaziDto) {
    console.log('[BaziController] 接收到八字生成请求:', body);
    
    const { birthDate, birthTime, userId } = body;
    
    // 校验必填参数
    if (!birthDate || !birthTime) {
      return {
        code: 400,
        msg: '缺少必填参数：birthDate 或 birthTime',
        data: null
      };
    }

    try {
      const result = this.baziService.generateBazi(birthDate, birthTime);
      
      const baziProfile = {
        id: `bazi_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        userId: userId || `user_${Date.now()}`,
        ...result,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      console.log('[BaziController] 八字生成成功:', baziProfile);

      return {
        code: 200,
        msg: 'success',
        data: baziProfile
      };
    } catch (error) {
      console.error('[BaziController] 八字生成失败:', error);
      return {
        code: 500,
        msg: error instanceof Error ? error.message : '八字生成失败',
        data: null
      };
    }
  }
}