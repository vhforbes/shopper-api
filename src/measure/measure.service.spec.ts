import { Test, TestingModule } from '@nestjs/testing';
import { MeasureService } from './measure.service';
import { ConfigService } from '@nestjs/config';
import { MeasureController } from './measure.controller';
import { IAIServiceToken } from '../common/interfaces/IAIService';
import { MeasureEntity } from './measure.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProcessImageDto } from './interfaces';

const mockConfigService = {
  get: jest.fn(),
};

const aiService = {
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

  it('should return customer measures', async () => {
    const customer_code = 'CUSTTOMER_UUID';
    const measure_type = 'WATER';
    const mockMeasures: MeasureEntity[] = [
      {
        measure_uuid: 'uuid',
        customer: { email: 'test@email.com', name: 'name', customer_code },
        measure_type: 'WATER',
        measure_value: 100,
        has_confirmed: true,
        image_url: 'img_url',
        measure_datetime: new Date('2022-07-01T14:30:00Z'),
      },
    ];

    mockRepository.find.mockResolvedValue(mockMeasures);

    const result = await service.listMeasures({ customer_code, measure_type });

    expect(result).toEqual({
      customer_code,
      measures: mockMeasures,
    });

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        customer: { customer_code },
        measure_type,
      },
    });
  });

  it('should error when no measures for customer', async () => {
    const customer_code = 'CUSTTOMER_UUID';
    const measure_type = 'WATER';

    mockRepository.find.mockResolvedValue([]);

    await expect(
      service.listMeasures({ customer_code, measure_type }),
    ).rejects.toThrow('MEASURES_NOT_FOUND');

    expect(mockRepository.find).toHaveBeenCalledWith({
      where: {
        customer: { customer_code },
        measure_type,
      },
    });
  });

  it('should confirm the measure amd update the value', async () => {
    const measure_uuid = 'MEASURE_UUID';
    const confirmed_value = 150;
    const mockMeasure = {
      measure_uuid,
      has_confirmed: false,
      measure_value: 100,
    };

    mockRepository.findOne.mockResolvedValue(mockMeasure);
    mockRepository.save.mockResolvedValue({
      ...mockMeasure,
      measure_value: confirmed_value,
      has_confirmed: true,
    });

    const result = await service.confirmMeasure({
      confirmed_value,
      measure_uuid,
    });

    expect(result).toBe(true);
    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { measure_uuid },
    });
    expect(mockMeasure.measure_value).toBe(confirmed_value);
    expect(mockMeasure.has_confirmed).toBe(true);
    expect(mockRepository.save).toHaveBeenCalledWith(mockMeasure);
  });

  it('should throw an error if measure not found', async () => {
    const measure_uuid = 'UUID_NOT_FOUND';
    const confirmed_value = 150;

    mockRepository.findOne.mockResolvedValue(null);

    await expect(
      service.confirmMeasure({ confirmed_value, measure_uuid }),
    ).rejects.toThrow('MEASURE_NOT_FOUND');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { measure_uuid },
    });
  });

  it('should throw an error if already confirmed', async () => {
    const measure_uuid = 'UUID123';
    const confirmed_value = 150;
    const mockMeasure = {
      measure_uuid,
      has_confirmed: true,
      measure_value: 100,
    };

    mockRepository.findOne.mockResolvedValue(mockMeasure);

    await expect(
      service.confirmMeasure({ confirmed_value, measure_uuid }),
    ).rejects.toThrow('CONFIRMATION_DUPLICATE');

    expect(mockRepository.findOne).toHaveBeenCalledWith({
      where: { measure_uuid },
    });
  });

  describe('MeasureService - processNewMeasure', () => {
    beforeEach(() => {
      jest.clearAllMocks(); // Clear all mocks to ensure isolation
    });

    it('should process a new measure successfully', async () => {
      const processImageDto: ProcessImageDto = {
        image: 'image_base64_data',
        customer_code: 'CUST123',
        measure_type: 'WATER',
        measure_datetime: 'date',
      };

      const mockAIResponse = {
        measure_value: 123,
        image_url: '/path/to/image.jpg',
      };

      const mockNewMeasure = {
        measure_uuid: 'uuid',
        customer: {
          email: 'test@email.com',
          name: 'name',
          customer_code: 'CUST123',
        },
        measure_type: 'WATER',
        measure_value: 100,
        has_confirmed: true,
        image_url: 'img_url',
        measure_datetime: new Date('2022-07-01T14:30:00Z'),
      };

      mockConfigService.get.mockReturnValue('http://localhost');
      mockRepository.save.mockResolvedValue(mockNewMeasure);
      jest.spyOn(service, 'checkDoubleReportMeasure').mockResolvedValue(false);

      aiService.getPictureReading.mockResolvedValue(mockAIResponse);
      jest.spyOn(service, 'createMeasure').mockResolvedValue(mockNewMeasure);

      const result = await service.processNewMeasure(processImageDto);

      expect(result).toEqual({
        measure_uuid: mockNewMeasure.measure_uuid,
        measure_value: mockNewMeasure.measure_value,
        image_url: mockNewMeasure.image_url,
      });

      expect(service.checkDoubleReportMeasure).toHaveBeenCalledWith({
        customer_code: processImageDto.customer_code,
        measure_type: processImageDto.measure_type,
        measure_datetime: processImageDto.measure_datetime,
      });

      expect(aiService.getPictureReading).toHaveBeenCalledWith({
        imageBase64: processImageDto.image,
        measure_datetime: processImageDto.measure_datetime,
      });

      expect(mockConfigService.get).toHaveBeenCalledWith('API_BASE_URL');
      expect(service.createMeasure).toHaveBeenCalledWith({
        measure_type: processImageDto.measure_type,
        image_url: 'http://localhost/path/to/image.jpg',
        customer_code: processImageDto.customer_code,
        measure_datetime: processImageDto.measure_datetime,
        measure_value: 123,
      });
    });

    it('should throw an error when a double report is detected', async () => {
      const processImageDto: ProcessImageDto = {
        image: 'image_base64_data',
        customer_code: 'CUST123',
        measure_type: 'WATER',
        measure_datetime: 'date',
      };

      // Simulate a double report being detected
      jest.spyOn(service, 'checkDoubleReportMeasure').mockResolvedValue(true);

      // Mock createMeasure to be tracked even though it's not supposed to be called
      jest.spyOn(service, 'createMeasure');

      await expect(service.processNewMeasure(processImageDto)).rejects.toThrow(
        'DOUBLE_REPORT',
      );

      expect(service.checkDoubleReportMeasure).toHaveBeenCalledWith({
        customer_code: processImageDto.customer_code,
        measure_type: processImageDto.measure_type,
        measure_datetime: processImageDto.measure_datetime,
      });

      expect(aiService.getPictureReading).not.toHaveBeenCalled();
      expect(service.createMeasure).not.toHaveBeenCalled();
    });
  });
});
