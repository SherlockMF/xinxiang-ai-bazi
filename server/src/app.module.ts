import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { AppService } from '@/app.service';
import { BaziController } from '@/bazi/bazi.controller';
import { BaziService } from '@/bazi/bazi.service';
import { FortuneController } from '@/fortune/fortune.controller';
import { FortuneService } from '@/fortune/fortune.service';
import { ChatController } from '@/chat/chat.controller';
import { ChatService } from '@/chat/chat.service';

@Module({
  imports: [],
  controllers: [AppController, BaziController, FortuneController, ChatController],
  providers: [AppService, BaziService, FortuneService, ChatService],
})
export class AppModule {}
