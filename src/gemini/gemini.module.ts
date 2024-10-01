import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { ConfigModule } from '@nestjs/config';
import { IAIServiceToken } from '@app/common/interfaces/IAIService';
import { ImageUploadModule } from '@app/image-upload/image-upload.module';

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
