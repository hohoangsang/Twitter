import { Pagination } from './tweet.requests';

export interface SearchQuery extends Pagination {
  content: string;
}
