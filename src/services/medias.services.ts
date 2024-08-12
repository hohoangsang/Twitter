import { Request } from 'express';
import path from 'path';
import sharp from 'sharp';
import { getNameFromFullName, handleUploadSingleFile } from '~/utils/file';
import fs from 'fs';
import { config } from 'dotenv';
import { isDevelopment } from '~/constants/config';

config();

class MediaService {
  async processSingleImage(req: Request) {
    const file = await handleUploadSingleFile(req);
    const newName = getNameFromFullName(file.newFilename) + '.jpeg';

    sharp(file.filepath)
      .jpeg({
        quality: 50
      })
      .toFile(path.resolve('uploads', newName), (err, info) => {
        if (err) {
          console.log('Error when format to File', err);
          return;
        }

        fs.unlink(file.filepath, (err) => {
          if (err) {
            console.error('Error when try to delete image in temp directory', err);
          } else {
            console.log('File deleted successfully');
          }
        });
      });

    const newUrlFile = isDevelopment
      ? `http://localhost:${process.env.PORT}/static/image/${newName}`
      : `${process.env.HOST}/static/image/${newName}`;

    return newUrlFile;
  }
}

const mediaService = new MediaService();

export default mediaService;
