import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { unlink } from 'fs/promises';
import { join } from 'path';

@Injectable()
export class HandleLocalFileService {
  private readonly logger = new Logger(HandleLocalFileService.name);
  private readonly destination = '/uploads/';

  setFileUrlForClient(filename: string): string {
    return `${this.destination}${filename}`;
  }

  setFileUrlForServer(filenames: string[]): string[] {
    const result = [];
    for (const filename of filenames) {
      if (!filename.includes(this.destination)) return filenames;
      result.push(filename.split(this.destination).pop());
    }
    return result;
  }

  async removeByFileNames(filenames: string[]): Promise<boolean> {
    if (!filenames.length) return true;
    try {
      await Promise.all(
        filenames?.map(async (filename) => {
          // const filePath = join(__dirname, '../../public/uploads', filename); chạy trong folder code thực thi
          const filePath = join(process.cwd(), 'public', 'uploads', filename);
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
