import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MeasureEntity } from './measure.entity';
import { MeasureService } from './measure.service';
import { MeasureController } from './measure.controller';
import { GeminiModule } from 'src/gemini/gemini.module';
import { GeminiService } from 'src/gemini/gemini.service';
import { IAIServiceToken } from 'src/common/interfaces/IAIService';

@Module({
  imports: [TypeOrmModule.forFeature([MeasureEntity]), GeminiModule],
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
