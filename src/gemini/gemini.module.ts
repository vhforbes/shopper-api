import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { IAIServiceToken } from 'src/common/interfaces/IAIService';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: IAIServiceToken,
      useClass: GeminiService,
    },
  ],
  exports: [IAIServiceToken],
})
export class GeminiModule {}
