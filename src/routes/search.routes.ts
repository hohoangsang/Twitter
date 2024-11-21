import express from 'express';
import { searchController } from '~/controllers/search.controller';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const searchRouter = express.Router();

/**
 * Descriptions: Search tweet
 * Methods: GET
 * Path: /
 * Query: {
 *  content: string;
 *  page: string;
 *  limit: string;
 * }
 */

searchRouter.get(
  '/',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(searchController)
);

export default searchRouter;
