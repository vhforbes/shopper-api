import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('measure')
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('process-image')
  @UseInterceptors(FileInterceptor('image'))
  async processImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<number> {
    const imageBase64 = file.buffer.toString('base64');
    const reading = await this.measureService.processImage(imageBase64);
    return reading;
  }
}
