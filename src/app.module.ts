import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { ConfigModule } from '@nestjs/config';
import { MeasureModule } from './measure/measure.module';
import { CustomerModule } from './customer/customer.module';
import { GeminiService } from './gemini/gemini.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ImageUploadModule } from './image-upload/image-upload.module';
import { ImageUploadService } from './image-upload/image-upload.service';

@Module({
  imports: [
    CommonModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'images'),
      serveRoot: '/app/images/',
    }),
    MeasureModule,
    CustomerModule,
    ImageUploadModule,
  ],
  controllers: [],
  providers: [GeminiService],
})
export class AppModule {}
