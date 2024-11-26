import { Query } from 'express-serve-static-core';
import { Pagination } from './tweet.requests';
import { PeopleSearchType, SearchType } from '~/constants/enum';

export interface SearchTweetQuery extends Pagination, Query {
  type: SearchType;
  searchString: string;
  media: string; // "true" | 'false'
  people: PeopleSearchType;
}
