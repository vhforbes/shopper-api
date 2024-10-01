import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ImageUploadService {
  uploadFile({
    imageBase64,
    fileName,
  }: {
    imageBase64: string;
    fileName: string;
  }) {
    // I would upload to a S3 here and have this in another service but for spped sake ill just store it locally
    const dir = path.join(__dirname, '../../images');

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Directory created: ${dir}`);
    }

    try {
      const buffer = Buffer.from(imageBase64, 'base64');
      const filePath = path.join(dir, `${fileName}.jpg`);
      fs.writeFileSync(filePath, buffer);
      console.log(`File written successfully: ${filePath}`);

      return filePath;
    } catch (error) {
      console.error('Error writing file:', error);
      throw new Error('Failed to save image');
    }
  }
}
