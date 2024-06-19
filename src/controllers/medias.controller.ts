import { NextFunction, Request, Response } from 'express';
import formidable from 'formidable';
import path from 'path';

export const uploadSingleImageController = (req: Request, res: Response, next: NextFunction) => {
  const form = formidable({
    uploadDir: path.resolve('uploads'),
    maxFiles: 1,
    maxFileSize: 1 * 1024 * 1024, // 1MB
    keepExtensions: true
  });

  form.parse(req, (err, fields, files) => {
    if (err) {
      throw err;
    }
    res.json({ message: 'Upload file successfully' });
  });
};
