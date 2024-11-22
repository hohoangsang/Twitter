import { Pagination } from './tweet.requests';

export interface SearchTweetQuery extends Pagination {
  content: string;
  hashtag: string;
}
