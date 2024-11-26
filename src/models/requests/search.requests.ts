import { Query } from 'express-serve-static-core';
import { Pagination } from './tweet.requests';

export type TypeSearch = 'CONTENT' | 'HASHTAG';
export type TypePeople = 'EVERYONE' | 'FOLLOWING';

export interface SearchTweetQuery extends Pagination, Query {
  type: TypeSearch;
  searchString: string;
  media: string; // "true" | 'false'
  people: TypePeople;
}
