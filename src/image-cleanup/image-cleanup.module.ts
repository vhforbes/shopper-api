import { Module } from '@nestjs/common';
import { ImageCleanupService } from './image-cleanup.service';

@Module({
  providers: [ImageCleanupService]
})
export class ImageCleanupModule {}
