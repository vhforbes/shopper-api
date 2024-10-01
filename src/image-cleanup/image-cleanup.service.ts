import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as cron from 'node-cron';

@Injectable()
export class ImageCleanupService implements OnModuleInit {
  private readonly imagesDir = path.join(__dirname, '../../images');

  onModuleInit() {
    cron.schedule('0 0 * * *', () => {
      this.deleteOldImages();
      console.log(`Image cleanup running at ${new Date()}`);
    });
  }

  private deleteOldImages() {
    const files = fs.readdirSync(this.imagesDir);

    const now = Date.now();
    const expirationTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

    files.forEach((file) => {
      const filePath = path.join(this.imagesDir, file);
      const stats = fs.statSync(filePath);

      if (now - stats.mtimeMs > expirationTime) {
        fs.unlinkSync(filePath);
        console.log(`Deleted old image: ${filePath}`);
      }
    });
  }
}
