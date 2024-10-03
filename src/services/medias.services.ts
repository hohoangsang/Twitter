import { Request } from 'express';
import path from 'path';
import sharp from 'sharp';
import {
  getNameFromFullName,
  handleUploadImages,
  handleUploadVideo,
  sanitizeFileName
} from '~/utils/file';
import fs from 'fs';
import fsPromise from 'node:fs/promises';
import { config } from 'dotenv';
import { isDevelopment } from '~/constants/config';
import { Media } from '~/models/Other';
import { MediaType } from '~/constants/enum';
import { UPLOAD_IMAGE_DIR, UPLOAD_VIDEO_DIR, UPLOAD_VIDEO_TEMP_DIR } from '~/constants/dir';
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video';

config();

class MediaService {
  async processImages(req: Request) {
    const files = await handleUploadImages(req);

    const result: Media[] = await Promise.all(
      files.map(async (file) => {
        const newName = getNameFromFullName(file.newFilename) + '.jpeg';

        sharp(file.filepath)
          .jpeg({
            quality: 50
          })
          .toFile(path.resolve(UPLOAD_IMAGE_DIR, newName), (err, info) => {
            if (err) {
              console.log('Error when format to File', err);
              return;
            }

            fsPromise.unlink(file.filepath).catch((err) => {
              console.log('Error when remove image', err);
            });
          });

        const newUrlFile = isDevelopment
          ? `http://localhost:${process.env.PORT}/static/image/${newName}`
          : `${process.env.HOST}/static/image/${newName}`;

        return {
          url: newUrlFile,
          type: MediaType.Image
        };
      })
    );

    return result;
  }

  async processVideo(req: Request) {
    const files = await handleUploadVideo(req);

    const result: Media[] = await Promise.all(
      files.map(async ({ newFilename }) => {
        const newUrlFile = isDevelopment
          ? `http://localhost:${process.env.PORT}/static/video/${newFilename}`
          : `${process.env.HOST}/static/video/${newFilename}`;

        return {
          url: newUrlFile,
          type: MediaType.Video
        };
      })
    );

    return result;
  }

  async processHLSVideo(req: Request) {
    const files = await handleUploadVideo(req);

    const result: Media[] = await Promise.all(
      files.map(async ({ newFilename, filepath }) => {
        await encodeHLSWithMultipleVideoStreams(filepath);

        await fsPromise
          .unlink(filepath)
          .then(() => {
            console.log(`File ${filepath} has been successfully removed.`);
          })
          .catch((err) => {
            console.error(`Error removing file: ${err}`);
          });

        const newName = getNameFromFullName(newFilename);

        const newUrlFile = isDevelopment
          ? `http://localhost:${process.env.PORT}/static/video-hls/${newName}`
          : `${process.env.HOST}/static/video-hls/${newName}`;

        return {
          url: newUrlFile,
          type: MediaType.HLS
        };
      })
    );

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
