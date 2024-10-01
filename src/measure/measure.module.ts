import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureEntity } from './measure.entity';
import { MeasureService } from './measure.service';
import { MeasureController } from './measure.controller';
import { ConfigModule } from '@nestjs/config';
import { GeminiModule } from '@app/gemini/gemini.module';
import { ImageUploadModule } from '@app/image-upload/image-upload.module';
import { IAIServiceToken } from '@app/common/interfaces/IAIService';
import { GeminiService } from '@app/gemini/gemini.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MeasureEntity]),
    GeminiModule,
    ConfigModule,
    ImageUploadModule,
  ],
  providers: [
    MeasureService,
    {
      provide: IAIServiceToken,
      useClass: GeminiService,
    },
  ],
  controllers: [MeasureController],
})
export class MeasureModule {}
