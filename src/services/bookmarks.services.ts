import Bookmarks from '~/models/schemas/bookmark.shema';
import databaseService from './database.services';
import { ObjectId } from 'mongodb';

class BookmarksService {
  async createBookmark({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const result = await databaseService.bookmarks.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Bookmarks({ tweet_id, user_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    return result;
  }

  async unBookmark({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const result = await databaseService.bookmarks.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });

    return result;
  }
}

const bookmarksService = new BookmarksService();

export default bookmarksService;
