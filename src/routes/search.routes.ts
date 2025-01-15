import express from 'express';
import { searchController } from '~/controllers/search.controllers';
import { searchValidator } from '~/middlewares/search.middleware';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const searchRouter = express.Router();

/**
 * Descriptions: Search tweet
 * Methods: GET
 * Path: /tweets
 * Query: {
 *  type: "HASHTAG" | "CONTENT"
 *  media?: 'true' | ''false,
 *  user?: 'true' | 'false',
 *  page: string;
 *  limit: string;
 *  searchString: string;
 *  people?: "EVERYONE" | "FOLLOWING"
 * }
 */

searchRouter.get(
  '/tweets',
  accessTokenValidator,
  verifiedUserValidator,
  searchValidator,
  wrapRequestHandler(searchController)
);

export default searchRouter;
