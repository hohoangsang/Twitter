import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { Fields, Files } from 'formidable';

export const initFolder = () => {
  const uploadFolderPath = path.resolve('uploads');

  if (!fs.existsSync(uploadFolderPath)) {
    fs.mkdirSync(uploadFolderPath, {
      recursive: true
    });
  }
};

export const handleUploadSingleFile = async (
  req: Request
): Promise<{ fields: Fields; files: Files }> => {
  const formidable = (await import('formidable')).default; //Import thư viện kiểu ES6 vào source code ES module

  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 300 * 1024, // 300KB
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
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.log('error', err);
        reject(err);
      }

      if (!Boolean(files.image)) {
        reject(new Error('Invalid file'));
      }

      resolve({ fields, files });
    });
  });
};
