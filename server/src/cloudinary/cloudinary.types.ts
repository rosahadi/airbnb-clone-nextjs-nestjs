export interface ImageUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

export interface ImageUploadOptions {
  baseFolder: string;
  subFolder: string;
  fileName: string;
  width?: number;
  height?: number;
  crop?: string;
  tags?: string[];
}

export type CloudinaryDeleteResult = {
  result: 'ok' | 'not found';
};
