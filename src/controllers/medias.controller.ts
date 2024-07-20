import { NextFunction, Request, Response } from 'express';
import path from 'path';
import { handleUploadSingleFile } from '~/utils/file';

export const uploadSingleImageController = async (req: Request, res: Response) => {
  const result = await handleUploadSingleFile(req);

  return res.json({ message: 'Upload successfully', result: result.files });
};
