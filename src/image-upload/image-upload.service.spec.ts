import { Test, TestingModule } from '@nestjs/testing';
import { ImageUploadService } from './image-upload.service';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('ImageUploadService', () => {
  let service: ImageUploadService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImageUploadService],
    }).compile();

    service = module.get<ImageUploadService>(ImageUploadService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('uploadFile', () => {
    const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAUA...'; // Mock base64 data
    const mockFileName = 'testImage';
    const mockDirPath = path.join(__dirname, '../../images');

    beforeEach(() => {
      // Mock implementation for the filesystem methods
      (fs.existsSync as jest.Mock).mockReturnValue(false); // Mock directory does not exist
      (fs.mkdirSync as jest.Mock).mockImplementation(() => {}); // Mock directory creation
      (fs.writeFileSync as jest.Mock).mockImplementation(() => {}); // Mock file writing
    });

    it('should create directory and write the file', () => {
      const filePath = service.uploadFile({
        imageBase64: mockImageBase64,
        fileName: mockFileName,
      });

      expect(fs.existsSync).toHaveBeenCalledWith(mockDirPath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(mockDirPath, {
        recursive: true,
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        path.join(mockDirPath, `${mockFileName}.jpg`),
        expect.any(Buffer),
      );
      expect(filePath).toBe(path.join(mockDirPath, `${mockFileName}.jpg`));
    });

    it('should throw an error if writing the file fails', () => {
      (fs.writeFileSync as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Mock error');
      });

      expect(() =>
        service.uploadFile({
          imageBase64: mockImageBase64,
          fileName: mockFileName,
        }),
      ).toThrow('Failed to save image');
    });
  });
});
