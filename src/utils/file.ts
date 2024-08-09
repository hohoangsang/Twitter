import { FILE_IMAGE_TYPE } from './../constants/file';
import { Request } from 'express';
import { File, Files } from 'formidable';
import fs from 'fs';
import { FILE_UPLOAD_TEMP_DIR } from '~/constants/dir';
import { MAX_SINGLE_IMAGE_SIZE } from '~/constants/file';

export const initFolder = () => {
  const uploadFolderPath = FILE_UPLOAD_TEMP_DIR;

  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
    });
  }
};

export const getNameFromFullName = (fileName: string) => {
  const arr = fileName.split('.');

  arr.pop();

  return arr.join('');
};

export const handleUploadSingleFile = async (req: Request): Promise<File> => {
  const formidable = (await import('formidable')).default; //Import thư viện kiểu ES6 vào source code ES module

  const form = formidable({
    uploadDir: FILE_UPLOAD_TEMP_DIR,
    maxFiles: 1,
    maxFileSize: MAX_SINGLE_IMAGE_SIZE,
    keepExtensions: true,
    multiples: false,
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

      ((files as Files).image as File[])[0];

      resolve((files.image as File[])[0]);
    });
  });
};
