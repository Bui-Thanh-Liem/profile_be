import { v2 as cloudinary } from 'cloudinary';

export const CloudinaryConfig = {
  cloud_name: 'your_cloud_name',
  api_key: 'your_api_key',
  api_secret: 'your_api_secret',
};

cloudinary.config(CloudinaryConfig);
