import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UtilSlug } from 'src/utils/Slug.util';

/**
 * Custom Decorator để upload 1 file
 * @param fieldName Tên field chứa file (mặc định là "image")
 * @param destination Nơi lưu file (mặc định là "./public/uploads")
 */
export function UploadSingleFile(
  otherFields?: Record<string, SchemaObject | ReferenceObject>,
  fieldFile = 'image',
  destination = './public/uploads',
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldFile, {
        storage: diskStorage({
          destination: (req, file, callback) => {
            const uploadPath = join(__dirname, '..', '..', destination);
            if (!fs.existsSync(uploadPath)) {
              fs.mkdirSync(uploadPath, { recursive: true });
            }
            callback(null, uploadPath);
          },
          filename: (req, file, callback) => {
            const ext = extname(file.originalname);
            const nameSlug = UtilSlug.generaSlug(file.originalname.split('.')[0]);
            callback(null, `${nameSlug}-${Date.now()}${ext}`);
          },
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn 5MB mỗi file
      }),
    ),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          ...otherFields,
          [fieldFile]: {
            type: 'string',
            format: 'binary',
            required: [`${fieldFile} is not empty`],
          },
        },
      },
    }),
  );
}
