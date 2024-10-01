import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MeasureModule } from './measure/measure.module';
import { CustomerModule } from './customer/customer.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    MeasureModule,
    CustomerModule,
    GeminiModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
