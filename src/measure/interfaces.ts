export interface ProcessImageDto {
  image: string;
  customer_code: string;
  measure_datetime: Date; // or string, depending on how you handle it
  measure_type: 'WATER' | 'GAS';
}
