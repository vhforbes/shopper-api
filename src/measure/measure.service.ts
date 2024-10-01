import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IAIService, IAIServiceToken } from 'src/common/interfaces/IAIService';
import { MeasureEntity } from './measure.entity';
import { Between, Repository } from 'typeorm';
import { ConfirmMeasureDto, ProcessImageDto } from './interfaces';
import { endOfMonth, startOfMonth } from 'date-fns';

@Injectable()
export class MeasureService {
  constructor(
    @Inject(IAIServiceToken)
    private readonly aiService: IAIService,

    @InjectRepository(MeasureEntity)
    private measureRepository: Repository<MeasureEntity>,
  ) {}

  async listMeasures({
    customer_code,
    measure_type,
  }: {
    customer_code: string;
    measure_type?: 'WATER' | 'GAS';
  }): Promise<{
    customer_code: string;
    measures: MeasureEntity[];
  }> {
    const measures = await this.measureRepository.find({
      where: {
        customer: { customer_code },
        ...(measure_type && { measure_type }),
      },
    });

    if (!measures.length) {
      throw new Error('MEASURES_NOT_FOUND');
    }

    return {
      customer_code,
      measures,
    };
  }

  async confirmMeasure({ confirmed_value, measure_uuid }: ConfirmMeasureDto) {
    const measureToConfirm = await this.measureRepository.findOne({
      where: {
        measure_uuid,
      },
    });

    if (!measureToConfirm) {
      throw new Error('MEASURE_NOT_FOUND');
    }

    if (measureToConfirm.has_confirmed) {
      throw new Error('CONFIRMATION_DUPLICATE');
    }

    measureToConfirm.measure_value = confirmed_value;
    measureToConfirm.has_confirmed = true;

    await this.measureRepository.save(measureToConfirm);

    return true;
  }

  async processNewMeasure({
    image,
    customer_code,
    measure_type,
    measure_datetime,
  }: ProcessImageDto): Promise<{
    image_url: string;
    measure_value: number;
    measure_uuid: string;
  }> {
    const isDoubleReport = await this.checkDoubleReportMeasure({
      customer_code,
      measure_type,
      measure_datetime,
    });

    if (isDoubleReport) {
      throw new Error('DOUBLE_REPORT');
    }

    const { measure_value, image_url } = await this.aiService.getPictureReading(
      { imageBase64: image },
    );

    const newMeasure = await this.createMeasure({
      measure_type,
      image_url,
      customer_code,
      measure_datetime,
      measure_value,
    });

    return {
      measure_uuid: newMeasure.measure_uuid,
      measure_value,
      image_url,
    };
  }

  async createMeasure({
    measure_type,
    image_url,
    customer_code,
    measure_value,
    measure_datetime,
  }): Promise<MeasureEntity> {
    const newMeasure = this.measureRepository.create({
      measure_type,
      image_url,
      measure_value,
      customer: { customer_code },
      measure_datetime,
      has_confirmed: false,
    });

    return await this.measureRepository.save(newMeasure);
  }

  async checkDoubleReportMeasure({
    customer_code,
    measure_type,
    measure_datetime,
  }: {
    customer_code: string;
    measure_datetime: string;
    measure_type: string;
  }): Promise<boolean> {
    const startOfMeasureMonth = startOfMonth(new Date(measure_datetime));
    const endOfMeasureMonth = endOfMonth(new Date(measure_datetime));

    const existingMeasure = await this.measureRepository.findOne({
      where: {
        customer: { customer_code },
        measure_type,
        measure_datetime: Between(startOfMeasureMonth, endOfMeasureMonth),
      },
    });

    return !!existingMeasure;
  }
}
