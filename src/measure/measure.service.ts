import { Inject, Injectable } from '@nestjs/common';
import { IAIService, IAIServiceToken } from 'src/common/interfaces/IAIService';

@Injectable()
export class MeasureService {
  constructor(
    @Inject(IAIServiceToken)
    private readonly aiService: IAIService,
  ) {}

  async processImage(imageBase64: string) {
    const reading = await this.aiService.getPictureReading({ imageBase64 });
    console.log('Reading from image:', reading);
    return reading;
  }
}
