export const IAIServiceToken = 'IAIServiceToken';

export interface IAIService {
  getPictureReading({ imageBase64 }: { imageBase64: string }): Promise<number>;
}
