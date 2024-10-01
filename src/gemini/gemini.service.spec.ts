import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { ConfigService } from '@nestjs/config';
import { ImageUploadService } from '../image-upload/image-upload.service';

const mockConfigService = {
  get: jest.fn(),
};

const mockImageUploadService = {
  uploadFile: jest.fn(),
};

describe('GeminiService', () => {
  let service: GeminiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeminiService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: ImageUploadService,
          useValue: mockImageUploadService,
        },
      ],
    }).compile();

    service = module.get<GeminiService>(GeminiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
