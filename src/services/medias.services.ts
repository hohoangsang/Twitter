import { Request } from 'express';
import path from 'path';
import sharp from 'sharp';
import { getNameFromFullName, handleUploadSingleFile } from '~/utils/file';
import fs from 'fs';
import { FILE_UPLOAD_TEMP_DIR } from '~/constants/dir';

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

        try {
          fs.unlinkSync(file.filepath);
        } catch (error) {
          console.log('Error when try to delete file path', error);
        }
      });

    const newUrlFile = `http://localhost/uploads/${newName}`;

    return newUrlFile;
  }
}

const mediaService = new MediaService();

export default mediaService;
