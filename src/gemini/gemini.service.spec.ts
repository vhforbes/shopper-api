import { Test, TestingModule } from '@nestjs/testing';
import { GeminiService } from './gemini.service';
import { ConfigService } from '@nestjs/config';
import { ImageUploadService } from '../image-upload/image-upload.service';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const mockConfigService = {
  get: jest.fn(),
};

const mockImageUploadService = {
  uploadFile: jest.fn(),
};

jest.mock('@google/generative-ai/server');
jest.mock('@google/generative-ai');

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

  it('should process picture reading and return correct values', async () => {
    const mockUploadFileResponse = {
      file: {
        displayName: 'Uploaded Image',
        uri: 'http://example.com/uploaded_image.jpg',
      },
    };

    const mockGeneratedResponse = {
      response: {
        text: jest.fn().mockReturnValue('123'), // Mocking the response text method
      },
    };

    // Setting up mocks for the class methods
    GoogleAIFileManager.prototype.uploadFile = jest
      .fn()
      .mockResolvedValue(mockUploadFileResponse);
    GoogleGenerativeAI.prototype.getGenerativeModel = jest
      .fn()
      .mockReturnValue({
        generateContent: jest.fn().mockResolvedValue(mockGeneratedResponse),
      });

    mockConfigService.get.mockReturnValue('mocked-gemini-api-key');
    mockImageUploadService.uploadFile.mockReturnValue('path/to/image.jpg');

    const result = await service.getPictureReading({
      imageBase64: 'base64-image-data',
      measure_datetime: '2024-01-01T00:00:00Z',
    });

    expect(result).toEqual({
      image_url: 'path/to/image.jpg',
      measure_value: 123,
    });
    expect(mockImageUploadService.uploadFile).toHaveBeenCalledWith({
      imageBase64: 'base64-image-data',
      fileName: '2024-01-01T00:00:00Z',
    });
    expect(GoogleAIFileManager.prototype.uploadFile).toHaveBeenCalled();
    expect(GoogleGenerativeAI.prototype.getGenerativeModel).toHaveBeenCalled();
  });
});
