import { Request } from 'express';
import { File, Files } from 'formidable';
import fs from 'fs';
import path from 'path';
import {
  UPLOAD_IMAGE_DIR,
  UPLOAD_IMAGE_TEMP_DIR,
  UPLOAD_VIDEO_DIR,
  UPLOAD_VIDEO_TEMP_DIR
} from '~/constants/dir';
import {
  MAX_SINGLE_IMAGE_SIZE,
  FILE_IMAGE_TYPE,
  MAX_IMAGE_UPLOAD,
  MAX_VIDEO_UPLOAD,
  MAX_SINGLE_VIDEO_SIZE,
  FILE_VIDEO_TYPE
} from '~/constants/file';

export const initFolder = () => {
  const filePath = [
    UPLOAD_IMAGE_DIR,
    UPLOAD_IMAGE_TEMP_DIR,
    UPLOAD_VIDEO_DIR,
    UPLOAD_VIDEO_TEMP_DIR
  ];

  filePath.forEach((path) => {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true
      });
    }
  });
};

export const getNameFromFullName = (fileName: string) => {
  const arr = fileName.split('.');

  arr.pop();

  return arr.join('');
};

export const handleUploadImages = async (req: Request): Promise<File[]> => {
  const formidable = (await import('formidable')).default; //Import thư viện kiểu ES6 vào source code ES module

  const form = formidable({
    uploadDir: UPLOAD_IMAGE_TEMP_DIR,
    maxFiles: MAX_IMAGE_UPLOAD, //max file amount
    maxFileSize: MAX_SINGLE_IMAGE_SIZE,
    maxTotalFileSize: MAX_SINGLE_IMAGE_SIZE * MAX_IMAGE_UPLOAD,
    keepExtensions: true,
    filter: ({ mimetype, name, originalFilename }) => {
      const valid = name === 'image' && mimetype?.includes('image/');

      if (!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any);
        return false;
      }

      return true;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files: Files<typeof FILE_IMAGE_TYPE>) => {
      if (err) {
        console.log('error', err);
        reject(err);
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.image)) {
        reject(new Error('Invalid file'));
      }

      resolve(files.image as File[]);
    });
  });
};

export const handleUploadVideo = async (req: Request): Promise<File[]> => {
  const formidable = (await import('formidable')).default;

  const nanoId = (await import('nanoid')).nanoid;

  const idName = nanoId();

  const filePath = path.resolve(UPLOAD_VIDEO_DIR, idName);

  fs.mkdirSync(filePath);

  const form = formidable({
    uploadDir: filePath,
    maxFiles: MAX_VIDEO_UPLOAD, //max file amount
    maxFileSize: MAX_SINGLE_VIDEO_SIZE,
    filter: ({ mimetype, name, originalFilename }) => {
      const valid =
        name === 'video' &&
        Boolean(
          mimetype?.includes('mp4') ||
            mimetype?.includes('quicktime') ||
            mimetype?.includes('octet-stream')
        );
      // const valid = name === 'video';

      if (!valid) {
        form.emit('error' as any, new Error('Invalid file type') as any);
        return false;
      }

      return true;
    },
    filename: () => {
      return idName;
    }
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files: Files<typeof FILE_VIDEO_TYPE>) => {
      if (err) {
        console.log('error', err);
        reject(err);
      }

      // eslint-disable-next-line no-extra-boolean-cast
      if (!Boolean(files.video)) {
        reject(new Error('Invalid file'));
      }

      //Handle sanitize file name and add extension to file name - start
      files.video?.forEach((video) => {
        let newName = video.newFilename;
        const originalFilenameSanitized = sanitizeFileName(video.originalFilename as string);
        const ext = getExtensionFile(originalFilenameSanitized);

        newName = newName + '.' + ext;

        fs.renameSync(video.filepath, path.resolve(filePath, newName));

        video.newFilename = newName;
        video.filepath = video.filepath + '.' + ext;
      });
      //Handle sanitize file name and add extension to file name - end

      resolve(files.video as File[]);
    });
  });
};

export function sanitizeFileName(orgName: string) {
  let newFileName = orgName;

  if (orgName.indexOf('.crdownload') >= 0) newFileName = newFileName.replace('.crdownload', '');

  return newFileName;
}

export function getExtensionFile(orgName: string) {
  const itemOrgName = orgName.split('.');

  return itemOrgName[itemOrgName.length - 1];
}
