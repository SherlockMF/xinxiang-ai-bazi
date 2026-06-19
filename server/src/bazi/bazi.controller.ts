// 八字生成控制器 - NestJS 后端
import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { BaziService } from './bazi.service';
import { BaziAnalysisService } from './bazi-analysis.service';
import type { AnalysisInput } from './bazi-analysis.prompt';

interface GenerateBaziDto {
  birthDate: string;
  birthTime: string;
  userId?: string;
}

interface AnalyzeBaziDto extends AnalysisInput {
  userId?: string;
}

@Controller('bazi')
export class BaziController {
  constructor(
    private readonly baziService: BaziService,
    private readonly baziAnalysisService: BaziAnalysisService
  ) {}

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

  /**
   * 八字深度分析（接入 LLM，基于前端已排四柱）
   */
  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  async analyzeBazi(@Body() body: AnalyzeBaziDto) {
    // 隐私：仅打印非敏感元信息，不记录出生信息 / 四柱内容
    console.log('[BaziController] 接收到深度分析请求:', {
      hasBazi: !!body?.bazi,
      hasDayMaster: !!body?.bazi?.dayMaster,
      gender: body?.gender || 'unknown'
    });

    // 校验：至少要有日主与四柱
    if (!body?.bazi || !body.bazi.dayMaster) {
      return {
        code: 400,
        msg: '缺少必填参数：bazi.dayMaster',
        data: null
      };
    }

    try {
      const result = await this.baziAnalysisService.generateAnalysis(body);

      console.log('[BaziController] 深度分析生成成功，长度:', result.content?.length ?? 0);

      return {
        code: 200,
        msg: 'success',
        data: {
          content: result.content,
          createdAt: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('[BaziController] 深度分析生成失败:', error);
      return {
        code: 500,
        msg: error instanceof Error ? error.message : '深度分析生成失败',
        data: null
      };
    }
  }
}