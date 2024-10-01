export const IAIServiceToken = 'IAIServiceToken';

export interface IAIService {
  getPictureReading({ imageBase64 }: { imageBase64: string }): Promise<{
    image_url: string;
    measure_value: number;
  }>;
}
