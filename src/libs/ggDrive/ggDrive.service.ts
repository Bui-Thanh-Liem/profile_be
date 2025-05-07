import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import * as path from 'path';
import { IResultUploadGGDrive } from 'src/interfaces/common.interface';
import { Readable } from 'stream';

@Injectable()
export class GgDriveService {
  private drive;
  private readonly logger = new Logger(GgDriveService.name);

  constructor() {
    const credentialPath = path.join(process.cwd(), 'info-google-drive.json');

    const auth = new google.auth.GoogleAuth({
      keyFile: credentialPath,
      scopes: ['https://www.googleapis.com/auth/drive'],
    });

    this.drive = google.drive({
      version: 'v3',
      auth,
      timeout: 120000,
      retryConfig: {
        retry: 3,
        retryDelay: 1000,
        onRetryAttempt: (err) => {
          this.logger.warn(`Retrying upload after error: ${err.message}`);
        },
      },
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<IResultUploadGGDrive> {
    try {
      //
      const MAX_FILE_SIZE = 100 * 1024 * 1024; // 10MB
      if (file.size > MAX_FILE_SIZE) {
        this.logger.error(`File too large: ${file.size} bytes`);
        throw new Error('File size exceeds maximum allowed (10MB)');
      }

      //
      const IMAGE_MIME_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'image/svg+xml'];
      const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'];

      //
      const isImage =
        IMAGE_MIME_TYPES.includes(file.mimetype) ||
        IMAGE_EXTENSIONS.some((ext) => file.originalname.toLowerCase().endsWith(ext));

      const folderId = isImage ? process.env.GG_DRIVE_FOLDER_IMAGE : process.env.GG_DRIVE_FOLDER_FILE;

      const realBuffer = Buffer.from(file.buffer);
      if (!Buffer.isBuffer(realBuffer)) {
        throw new Error('file.buffer is not a valid Buffer');
      }

      // Chuyển buffer thành stream
      const bufferStream = new Readable();
      bufferStream.push(realBuffer);
      bufferStream.push(null);

      // Tạo file trên Google Drive
      const filename = `${file.originalname}_${Date.now().toString()}`;
      const createFile = await this.drive.files.create({
        requestBody: {
          name: filename,
          mimeType: file.mimetype,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: bufferStream,
        },
        fields: 'id', // Chỉ lấy ID file
      });

      //
      const fileId = createFile.data.id;
      if (!fileId) {
        throw new BadRequestException('Unable to get ID file!');
      }

      // Set quyền public
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Lấy link public của file
      const result = await this.drive.files.get({
        fileId,
        fields: 'webViewLink, webContentLink',
      });

      const fileTypeParam = isImage ? '&type=image' : '';

      this.logger.log(`Upload process completed for: ${filename}`);
      return {
        fileId,
        viewUrl: result.data.webViewLink + fileTypeParam, // Link xem trên Google Drive
        downloadUrl: result.data.webContentLink, // Link tải trực tiếp
      };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      throw new BadRequestException(error);
    }
  }

  async deleteFileById(fileId: string, ignoreNotFoundError = false): Promise<boolean> {
    try {
      await this.drive.files.delete({
        fileId,
      });

      this.logger.log(`Deleted file with ID: ${fileId}`);
      return true;
    } catch (error: any) {
      if (ignoreNotFoundError && error.response?.status === 404) {
        this.logger.warn(`File with ID: ${fileId} not found, but ignoring the error.`);
        return false; // Indicate that the file was not found but continue execution
      }

      this.logger.error(`Failed to delete file: ${error.message}`);
      new BadRequestException('Failed to delete file');
    }
  }

  async deleteFileByUrl(viewUrl: string, ignoreNotFoundError = false): Promise<boolean> {
    try {
      if (!viewUrl) return true;
      const match = viewUrl.match(/\/d\/(.*?)(\/|$)/);
      if (!match || !match[1]) {
        throw new Error('FileId not found in viewUrl');
      }

      const fileId = match[1];
      return await this.deleteFileById(fileId, ignoreNotFoundError);
    } catch (error) {
      this.logger.error(`Error deleting file from URL: ${error.message}`);
      new BadRequestException('Error deleting file from URL');
    }
  }
}
