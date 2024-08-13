import { Request } from 'express';
import { File, Files } from 'formidable';
import fs from 'fs';
import { FILE_UPLOAD_TEMP_DIR } from '~/constants/dir';
import { MAX_SINGLE_IMAGE_SIZE, FILE_IMAGE_TYPE, MAX_IMAGE_UPLOAD } from '~/constants/file';

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

export const handleUploadImages = async (req: Request): Promise<File[]> => {
  const formidable = (await import('formidable')).default; //Import thư viện kiểu ES6 vào source code ES module

  const form = formidable({
    uploadDir: FILE_UPLOAD_TEMP_DIR,
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
