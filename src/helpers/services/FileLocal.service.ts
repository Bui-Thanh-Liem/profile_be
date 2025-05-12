import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class FileLocalService {
  private readonly logger = new Logger(FileLocalService.name);
  private readonly destination = 'uploads';

  async removeByFileNames(filenames: string[]): Promise<boolean> {
    if (!filenames.length) return true;
    try {
      await Promise.all(
        filenames?.map(async (filename) => {
          // const filePath = join(__dirname, '../../public/uploads', filename); chạy trong folder code thực thi
          const filePath = join(process.cwd(), 'public', this.destination, filename);
          this.logger.debug('removeByFileNames filePath ::: ', filePath);
          try {
            await unlink(filePath);
            return true;
          } catch (error: any) {
            if (error.code === 'ENOENT') {
              throw new NotFoundException(`File not found: ${filename}, skipping deletion.`);
            }
            throw new BadRequestException(`Failed to delete file: ${filename}`);
          }
        }),
      );
      return true;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException('Failed to delete files.');
    }
  }
}
