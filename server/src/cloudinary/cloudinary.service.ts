import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { CloudinaryConfig } from '../config/cloudinary.config';
import {
  ImageUploadOptions,
  ImageUploadResult,
  CloudinaryDeleteResult,
} from './cloudinary.types';

@Injectable()
export class CloudinaryService implements OnModuleInit {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly config: CloudinaryConfig;

  constructor(private readonly configService: ConfigService) {
    this.config = this.configService.getOrThrow<CloudinaryConfig>('cloudinary');
  }

  onModuleInit() {
    cloudinary.config({
      cloud_name: this.config.cloudName,
      api_key: this.config.apiKey,
      api_secret: this.config.apiSecret,
    });
    this.logger.log('Cloudinary initialized successfully');
  }

  /**
   * Upload an image to Cloudinary with specified options
   */
  async uploadImage(
    fileBuffer: Buffer,
    options: ImageUploadOptions,
  ): Promise<ImageUploadResult> {
    try {
      // Combine baseFolder and subFolder to create the full folder path
      const folderPath = `${options.baseFolder}/${options.subFolder}`;

      const result = await this.uploadWithRetry(() =>
        this.uploadToCloudinary(fileBuffer, {
          resource_type: 'image',
          folder: folderPath,
          public_id: `${Date.now()}-${options.fileName}`,
          overwrite: true,
          transformation: [
            {
              width: options.width || 1000,
              height: options.height || 1000,
              crop: options.crop || 'limit',
            },
          ],
          tags: options.tags,
        }),
      );

      return {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown upload error';
      this.logger.error(`Failed to upload image: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Image upload failed: ${errorMessage}`,
      );
    }
  }

  /**
   * Upload a profile image
   */
  async uploadProfileImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<ImageUploadResult> {
    return this.uploadImage(fileBuffer, {
      baseFolder: this.config.baseFolder,
      subFolder: this.config.folders.profiles,
      fileName,
      width: 500,
      height: 500,
      crop: 'limit',
      tags: ['profile', 'airbnb'],
    });
  }

  /**
   * Upload a property image
   */
  async uploadPropertyImage(
    fileBuffer: Buffer,
    fileName: string,
  ): Promise<ImageUploadResult> {
    return this.uploadImage(fileBuffer, {
      baseFolder: this.config.baseFolder,
      subFolder: this.config.folders.properties,
      fileName,
      width: 1200,
      height: 800,
      crop: 'limit',
      tags: ['property', 'airbnb'],
    });
  }

  /**
   * Delete an image from Cloudinary by URL or public ID
   */
  async deleteImage(identifier: string): Promise<boolean> {
    try {
      // Check if identifier is a URL and extract public ID if needed
      const publicId = identifier.includes('http')
        ? this.extractPublicIdFromUrl(identifier)
        : identifier;

      if (!publicId) {
        throw new BadRequestException(
          'Invalid Cloudinary identifier provided.',
        );
      }

      const result = (await cloudinary.uploader.destroy(
        publicId,
      )) as CloudinaryDeleteResult;

      if (result.result !== 'ok') {
        this.logger.warn(
          `Failed to delete image ${publicId}: ${result.result}`,
        );
        throw new BadRequestException(
          `Failed to delete image: ${result.result}`,
        );
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown delete error';
      this.logger.error(`Error deleting image: ${errorMessage}`);
      throw new InternalServerErrorException(
        `Image deletion failed: ${errorMessage}`,
      );
    }
  }

  /**
   * Extract public ID from a Cloudinary URL
   */
  private extractPublicIdFromUrl(url: string): string | null {
    try {
      const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
      const matches = url.match(regex);
      return matches ? matches[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Upload a file to Cloudinary with the provided options
   */
  private uploadToCloudinary(
    fileBuffer: Buffer,
    options: UploadApiOptions,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            return reject(
              new Error(error.message || 'Cloudinary upload failed'),
            );
          }
          if (!result) {
            return reject(new Error('No result returned from Cloudinary'));
          }
          resolve(result);
        },
      );
      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Upload with retry logic for improved reliability
   */
  private async uploadWithRetry(
    uploadFn: () => Promise<UploadApiResponse>,
    retries = 3,
    delay = 1000,
  ): Promise<UploadApiResponse> {
    try {
      return await uploadFn();
    } catch (error) {
      if (retries <= 0) throw error;

      this.logger.warn(
        `Upload failed, retrying in ${delay}ms... (${retries} attempts left)`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return this.uploadWithRetry(uploadFn, retries - 1, delay * 2);
    }
  }
}
