export interface ConfirmMeasureDto {
  measure_uuid: string;
  confirmed_value: number;
}

export interface ProcessImageDto {
  image: string;
  customer_code: string;
  measure_datetime: string; // or string, depending on how you handle it
  measure_type: 'WATER' | 'GAS';
}
