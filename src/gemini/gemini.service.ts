import { Injectable } from '@nestjs/common';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { IAIService } from '@app/common/interfaces/IAIService';

@Injectable()
export class GeminiService implements IAIService {
  constructor(
    private configService: ConfigService,
    private imageUploadService: ImageUploadService,
  ) {}

  async getPictureReading({
    imageBase64,
    measure_datetime,
  }: {
    imageBase64: string;
    measure_datetime: string;
  }): Promise<{
    image_url: string;
    measure_value: number;
  }> {
    const imagePath = this.imageUploadService.uploadFile({
      imageBase64,
      fileName: measure_datetime,
    });

    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    const fileManager = new GoogleAIFileManager(apiKey);

    const uploadResult = await fileManager.uploadFile(imagePath, {
      mimeType: 'image/jpeg',
      displayName: 'Jetpack drawing',
    });

    // View the response.
    console.log(
      `Uploaded file ${uploadResult.file.displayName} as: ${uploadResult.file.uri}`,
    );

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent([
      'Give me the number from the image, answer with just a number and nothing else. If you can`t see the number just answer with 0',
      {
        fileData: {
          fileUri: uploadResult.file.uri,
          mimeType: 'image/jpeg',
        },
      },
    ]);

    // Maybe add a treatment here if it cant find the number
    // What do we wan't to do? Prompt the user to upload again?
    // Since its not defined im returning it as 0

    return {
      image_url: imagePath,
      measure_value: parseFloat(result.response.text()),
    };
  }
}
