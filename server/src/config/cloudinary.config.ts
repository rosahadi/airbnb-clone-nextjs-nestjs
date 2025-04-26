import { registerAs } from '@nestjs/config';

export interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  baseFolder: string;
  folders: {
    profiles: string;
    properties: string;
  };
  limits: {
    profileSize: number;
    propertySize: number;
  };
}

export const cloudinaryConfig = registerAs(
  'cloudinary',
  (): CloudinaryConfig => ({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME as string,
    apiKey: process.env.CLOUDINARY_API_KEY as string,
    apiSecret: process.env.CLOUDINARY_API_SECRET as string,
    baseFolder: process.env.CLOUDINARY_BASE_FOLDER || 'airbnb',
    folders: {
      profiles: 'profile-images',
      properties: 'property-images',
    },
    limits: {
      profileSize: Number(
        process.env.CLOUDINARY_PROFILE_SIZE_LIMIT || 5 * 1024 * 1024,
      ),
      propertySize: Number(
        process.env.CLOUDINARY_PROPERTY_SIZE_LIMIT || 10 * 1024 * 1024,
      ),
    },
  }),
);
