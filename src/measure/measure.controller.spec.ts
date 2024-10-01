import { Test, TestingModule } from '@nestjs/testing';
import { MeasureController } from './measure.controller';
import { MeasureService } from './measure.service';
import { ConfigService } from '@nestjs/config';
import { IAIService, IAIServiceToken } from '../common/interfaces/IAIService';
import { getRepositoryToken } from '@nestjs/typeorm';
import { MeasureEntity } from './measure.entity';
import { Repository } from 'typeorm';

const aiService: IAIService = {
  getPictureReading: jest.fn(),
};

describe('MeasureController', () => {
  let controller: MeasureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeasureController],
      providers: [
        MeasureService,
        ConfigService,
        {
          provide: IAIServiceToken,
          useValue: aiService,
        },
        {
          provide: getRepositoryToken(MeasureEntity),
          useValue: Repository<MeasureEntity>,
        },
      ],
    }).compile();

    controller = module.get<MeasureController>(MeasureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
