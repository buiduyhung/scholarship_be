// cloudinary.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';
import { CloudinaryResponse } from './cloudinary-response';

@Injectable()
export class CloudinaryService {
  private logger = new Logger(CloudinaryService.name);
  public readonly cloudinary = cloudinary;

  constructor() {}
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      this.logger.log('Uploading file to cloudinary'.concat(file.originalname));
      const uploadStream = cloudinary.uploader.upload_stream(
        {},
        (error, result) => {
          if (error) {
            this.logger.error(error);
            reject(error);
          }
          this.logger.log(
            'File uploaded to cloudinary'.concat(file.originalname),
          );
          this.logger.debug({
            url: result.url,
            dimensions: result.width + 'x' + result.height,
            asset_id: result.asset_id,
            public_id: result.public_id,
          });
          resolve(result);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
