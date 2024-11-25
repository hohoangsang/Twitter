import express from 'express';
import { searchController } from '~/controllers/search.controller';
import { accessTokenValidator, verifiedUserValidator } from '~/middlewares/users.middlewares';
import { wrapRequestHandler } from '~/utils/handlers';

const searchRouter = express.Router();

/**
 * Descriptions: Search tweet
 * Methods: GET
 * Path: /tweets
 * Query: {
 *  type: "HASHTAG" | "CONTENT"
 *  media: boolean,
 *  user: boolean,
 *  page: string;
 *  limit: string;
 *  searchString: string;
 *  people: "EVERYONE" | "FOLLOWING"
 * }
 */

searchRouter.get(
  '/tweets',
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(searchController)
);

export default searchRouter;
