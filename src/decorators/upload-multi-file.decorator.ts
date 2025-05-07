import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { ReferenceObject, SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { UtilSlug } from 'src/utils/Slug.util';
import * as fs from 'fs';

/**
 * Custom Decorator để upload nhiều file
 * @param fieldName Tên field chứa files (mặc định là "images")
 * @param maxCount Số lượng file tối đa (mặc định là 5)
 * @param destination Nơi lưu file (mặc định là "./public/uploads")
 */
export function UploadMultipleFiles(
  otherFields?: Record<string, SchemaObject | ReferenceObject>,
  fieldFile = 'images',
  maxCount = 5,
  destination = './public/uploads',
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(fieldFile, maxCount, {
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
            type: 'array',
            items: {
              type: 'string',
              format: 'binary',
            },
          },
        },
      },
    }),
  );
}
