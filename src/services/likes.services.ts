import { ObjectId } from 'mongodb';
import databaseService from './database.services';
import Like from '~/models/schemas/like.schema';

class LikeService {
  async like({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const result = await databaseService.likes.findOneAndUpdate(
      {
        user_id: new ObjectId(user_id),
        tweet_id: new ObjectId(tweet_id)
      },
      {
        $setOnInsert: new Like({ tweet_id, user_id })
      },
      {
        upsert: true,
        returnDocument: 'after'
      }
    );

    return result;
  }

  async unLike({ tweet_id, user_id }: { tweet_id: string; user_id: string }) {
    const result = await databaseService.likes.findOneAndDelete({
      user_id: new ObjectId(user_id),
      tweet_id: new ObjectId(tweet_id)
    });

    return result;
  }
}

const likeService = new LikeService();

export default likeService;
