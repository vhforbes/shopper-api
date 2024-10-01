import { Test, TestingModule } from '@nestjs/testing';
import { ImageCleanupService } from './image-cleanup.service';

describe('ImageCleanupService', () => {
  let service: ImageCleanupService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageCleanupService],
    }).compile();

    service = module.get<ImageCleanupService>(ImageCleanupService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
