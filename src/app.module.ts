import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MeasureModule } from './measure/measure.module';
import { CustomerModule } from './customer/customer.module';
import { GeminiService } from './gemini/gemini.service';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MeasureModule,
    CustomerModule,
  ],
  controllers: [],
  providers: [GeminiService],
})
export class AppModule {}
