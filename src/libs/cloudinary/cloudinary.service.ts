import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  async uploadFile(file: Express.Multer.File, folder: string): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'auto',
          },
          (error, result: any) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async uploadMultipleFiles(files: Express.Multer.File[], folder: string): Promise<CloudinaryResponse[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async uploadImage(file: Express.Multer.File, folder: string): Promise<CloudinaryResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder,
            resource_type: 'image',
            transformation: [{ width: 1000, crop: 'limit' }, { quality: 'auto' }, { fetch_format: 'auto' }],
          },
          (error, result: any) => {
            if (error) return reject(error);
            resolve(result);
          },
        )
        .end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getFileUrl(publicId: string): string {
    return cloudinary.url(publicId);
  }
}
