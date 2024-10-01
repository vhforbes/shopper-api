import { Injectable } from '@nestjs/common';
import { IAIService } from 'src/common/interfaces/IAIService';

@Injectable()
export class GeminiService implements IAIService {
  async getPictureReading({
    imageBase64,
  }: {
    imageBase64: string;
  }): Promise<number> {
    console.log('MAKING REQUEST TO GEMNI');

    return 64;

    const response = await fetch('https://api.gemini.com/v1/your-endpoint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: imageBase64,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error fetching data: ${response.statusText}`);
    }

    const data = await response.json();

    return data.reading;
  }
}
