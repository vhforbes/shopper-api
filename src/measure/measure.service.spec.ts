import { Test, TestingModule } from '@nestjs/testing';
import { MeasureService } from './measure.service';
import { ConfigService } from '@nestjs/config';
import { MeasureController } from './measure.controller';
import { IAIService, IAIServiceToken } from '../common/interfaces/IAIService';
import { MeasureEntity } from './measure.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

const mockConfigService = {
  get: jest.fn(),
};

const aiService: IAIService = {
  getPictureReading: jest.fn(),
};

const mockRepository = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('MeasureService', () => {
  let service: MeasureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeasureService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: IAIServiceToken,
          useValue: aiService,
        },
        {
          provide: getRepositoryToken(MeasureEntity),
          useValue: mockRepository,
        },
        MeasureController,
      ],
    }).compile();

    service = module.get<MeasureService>(MeasureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
