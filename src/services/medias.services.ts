import { config } from 'dotenv';
import { Request } from 'express';
import fsPromise from 'node:fs/promises';
import path from 'path';
import sharp from 'sharp';
import { isDevelopment } from '~/constants/config';
import { UPLOAD_IMAGE_DIR } from '~/constants/dir';
import { EncodeHLSType, MediaType } from '~/constants/enum';
import { Media } from '~/models/Other';
import { getNameFromFullName, handleUploadImages, handleUploadVideo } from '~/utils/file';
import { encodeHLSWithMultipleVideoStreams } from '~/utils/video';
import databaseService from './database.services';
import StatusVideos from '~/models/schemas/statusVideos.schema';
import { ErrorWithStatus } from '~/models/errors';
import { HTTP_STATUS } from '~/constants/httpStatus';
import { MEDIA_MESSAGES } from '~/constants/message';

config();

function getIdNameFromVideoPath(videoPath: string) {
  const parts = videoPath.split('\\');

  const idName = getNameFromFullName(parts[parts.length - 1]);

  return idName;
}

async function updateOneStatusVideos(idName: string, status: EncodeHLSType) {
  await databaseService.statusVideos.updateOne(
    {
      idName
    },
    {
      $set: {
        status
      },
      $currentDate: {
        updated_at: true
      }
    }
  );
}

class Queue {
  processing: boolean;
  queue: string[];

  constructor() {
    this.queue = [];
    this.processing = false;
  }

  async enQueue({ filePath, idName }: { filePath: string; idName: string }) {
    this.queue.push(filePath);

    await databaseService.statusVideos.insertOne(
      new StatusVideos({
        idName,
        status: EncodeHLSType.pending
      })
    );

    this.processQueue();
  }

  async processQueue() {
    if (this.processing || !this.queue.length) return;

    this.processing = true;

    const videoPath = this.queue.shift();

    const idName = getIdNameFromVideoPath(videoPath as string);

    try {
      await updateOneStatusVideos(idName, EncodeHLSType.encoding);

      await encodeHLSWithMultipleVideoStreams(videoPath as string);

      await fsPromise
        .unlink(videoPath as string)
        .then(() => {
          console.log(`File ${videoPath} has been successfully removed.`);
        })
        .catch((err) => {
          console.error(`Error removing file: ${err}`);
        });

      console.count('Encoding success');

      this.processing = false;

      await updateOneStatusVideos(idName, EncodeHLSType.complete);
    } catch (error) {
      await updateOneStatusVideos(idName, EncodeHLSType.failed).catch((err) => {
        console.log('Error when update status into status_videos collection', err);
      });

      console.log('Error in queue HLS encoding', error);
    }

    this.processQueue();
  }
}

const encodeQueue = new Queue();

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
        const newName = getNameFromFullName(newFilename);

        encodeQueue.enQueue({ filePath: filepath, idName: newName });

        const newUrlFile = isDevelopment
          ? `http://localhost:${process.env.PORT}/static/video-hls/${newName}/master.m3u8`
          : `${process.env.HOST}/static/video-hls/${newName}/master.m3u8`;

        return {
          url: newUrlFile,
          type: MediaType.HLS
        };
      })
    );

    return result;
  }

  async getStatusEncodeHlS(idName: string) {
    const result = await databaseService.statusVideos.findOne({ idName });

    if (!result) {
      throw new ErrorWithStatus({
        status: HTTP_STATUS.NOT_FOUND,
        message: MEDIA_MESSAGES.IDNAME_NOTFOUND
      });
    }

    return result;
  }
}

const mediaService = new MediaService();

export default mediaService;
