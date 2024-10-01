import {
  Controller,
  Post,
  ConflictException,
  BadRequestException,
  Body,
  Patch,
  NotFoundException,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { MeasureService } from './measure.service';
import { ConfirmMeasureDto, ProcessImageDto } from './interfaces';
import { IErrorResponse } from '@app/common/interfaces/IErrorResponse';
import { MeasureEntity } from './measure.entity';

@Controller()
export class MeasureController {
  constructor(private readonly measureService: MeasureService) {}

  @Get(':customer_code/list')
  async getMeasures(
    @Param('customer_code') customer_code: string,
    @Query('measure_type') measure_type?: 'WATER' | 'GAS',
  ): Promise<
    { customer_code: string; measures: MeasureEntity[] } | IErrorResponse
  > {
    if (measure_type && measure_type !== 'WATER' && measure_type !== 'GAS') {
      throw new BadRequestException({
        error_code: 'INVALID_MEASURE_TYPE',
        error_description: 'measure_type must be "WATER" or "GAS".',
      });
    }

    try {
      const response = await this.measureService.listMeasures({
        customer_code,
        measure_type,
      });

      return response;
    } catch (error) {
      if (error.message === 'MEASURES_NOT_FOUND') {
        throw new NotFoundException({
          error_code: 'MEASURES_NOT_FOUND',
          error_description: 'Nenhuma leitura encontrada',
        });
      }

      console.error(error);
    }
  }

  @Patch('confirm')
  async confirmMeasure(
    @Body() body: ConfirmMeasureDto,
  ): Promise<{ success: boolean } | IErrorResponse> {
    if (!body.measure_uuid || !body.confirmed_value) {
      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'All fields are required.',
      });
    }

    try {
      await this.measureService.confirmMeasure(body);

      return {
        success: true,
      };
    } catch (error) {
      if (error.message === 'MEASURE_NOT_FOUND') {
        throw new NotFoundException({
          error_code: 'MEASURE_NOT_FOUND',
          error_description: 'Leitura nao encontrada',
        });
      }

      if (error.message === 'CONFIRMATION_DUPLICATE') {
        throw new ConflictException({
          error_code: 'CONFIRMATION_DUPLICATE',
          error_description: 'Leitura do mês já realizada',
        });
      }

      throw new BadRequestException({
        error_code: 'INVALID_DATA',
        error_description: 'Invalid data provided.',
      });
    }
  }

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
      const { image_url, measure_value, measure_uuid } =
        await this.measureService.processNewMeasure({
          image: body.image,
          customer_code: body.customer_code,
          measure_datetime: body.measure_datetime,
          measure_type: body.measure_type,
        });

      return {
        image_url: image_url,
        measure_value: measure_value,
        measure_uuid: measure_uuid,
      };
    } catch (error) {
      console.error(error);

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
