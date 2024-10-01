import { Injectable } from '@nestjs/common';
import { IAIService } from 'src/common/interfaces/IAIService';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService implements IAIService {
  constructor(private configService: ConfigService) {} // Inject ConfigService

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
    // I would upload to a S3 here and have this in another service but for spped sake ill just store it locally
    // TODO: Upload with diff file names
    const uploadFile = (imageBase64: string) => {
      const dir = path.join(__dirname, '../../images');

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Directory created: ${dir}`);
      }

      try {
        const buffer = Buffer.from(imageBase64, 'base64');
        const filePath = path.join(dir, `${measure_datetime}.jpg`); // Use absolute path for writing the file
        fs.writeFileSync(filePath, buffer);
        console.log(`File written successfully: ${filePath}`);

        return filePath;
      } catch (error) {
        console.error('Error writing file:', error);
        throw new Error('Failed to save image');
      }
    };

    const imagePath = uploadFile(imageBase64);
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

    return {
      image_url: imagePath,
      measure_value: parseFloat(result.response.text()),
    };
  }
}
