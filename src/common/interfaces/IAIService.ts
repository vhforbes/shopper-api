export const IAIServiceToken = 'IAIServiceToken';

export interface IAIService {
  getPictureReading({
    imageBase64,
    measure_datetime,
  }: {
    imageBase64: string;
    measure_datetime: string;
  }): Promise<{
    image_url: string;
    measure_value: number;
  }>;
}
