import {
  Controller,
  Post,
  ConflictException,
  BadRequestException,
  Body,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { IErrorResponse } from 'src/common/interfaces/IErrorResponse';
import { ProcessImageDto } from './interfaces';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Post('upload')
  async processImage(
    @Body() body: ProcessImageDto,
  ): Promise<
    | { image_url: string; measure_value: number; measure_uuid: string }
    | IErrorResponse
  > {
    // Validate the incoming data
    if (
      !body.image ||
      !body.customer_code ||
      !body.measure_datetime ||
      !body.measure_type
    ) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'All fields are required.',
      });
    }

    if (!['WATER', 'GAS'].includes(body.measure_type)) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'measure_type must be "WATER" or "GAS".',
      });
    }

    try {
      const reading = await this.measureService.processImage(body.image);

      return {
        image_url: 'string',
        measure_value: reading,
        measure_uuid: 'string',
      };
    } catch (error) {
      // TODO: I NEED TO THROW THIS ERROR IN THE SERVICE
      if (error.message === 'DOUBLE_REPORT') {
        throw new ConflictException({
          error_code: 'DOUBLE_REPORT',
          error_description: 'Leitura do mês já realizada.',
        });
      }

      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid data provided.',
      });
    }
  }
}
