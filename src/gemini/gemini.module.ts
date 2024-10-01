import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { IAIServiceToken } from 'src/common/interfaces/IAIService';
import { ConfigModule } from '@nestjs/config';
import { ImageUploadModule } from 'src/image-upload/image-upload.module';

@Module({
  imports: [ConfigModule, ImageUploadModule],
  providers: [
    {
      provide: IAIServiceToken,
      useClass: GeminiService,
    },
  ],
  exports: [IAIServiceToken],
})
export class GeminiModule {}
