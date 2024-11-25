import { Pagination } from './tweet.requests';

export type TypeSearch = 'CONTENT' | 'HASHTAG';

export interface SearchTweetQuery extends Pagination {
  type: TypeSearch;
  searchString: string;
  media: string; // "true" | 'false'
}
