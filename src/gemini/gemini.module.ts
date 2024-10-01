import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { IAIServiceToken } from 'src/common/interfaces/IAIService';

@Module({
  providers: [
    {
      provide: IAIServiceToken,
      useClass: GeminiService,
    },
  ],
  exports: [IAIServiceToken],
})
export class GeminiModule {}
