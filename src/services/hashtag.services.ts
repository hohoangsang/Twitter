import Hashtag from '~/models/schemas/hashtag.schema';
import databaseService from './database.services';
import { Filter, ObjectId, WithId } from 'mongodb';

class HashtagsService {
  async findManyHashtag({ key, arrIn }: { key: keyof Hashtag; arrIn: any[] }) {
    const query: Filter<Hashtag> = {
      [key]: {
        $in: arrIn
      }
    };

    const result = databaseService.hashtags.find(query).toArray();

    return result;
  }

  async insertManyHashtag(hashtags: string[]) {
    const newHashtagsDocument = hashtags.map((name) => new Hashtag({ name }));

    const result = await databaseService.hashtags.insertMany(newHashtagsDocument);

    const idsArray = Object.values(result.insertedIds);

    const listNewHashTag = await this.findManyHashtag({ key: '_id', arrIn: idsArray });

    return listNewHashTag;
  }

  async checkAndCreateHashtags(hashtags: string[]) {
    const documents = await Promise.all(
      hashtags.map((name) => {
        return databaseService.hashtags.findOneAndUpdate(
          {
            name
          },
          {
            $setOnInsert: new Hashtag({ name })
          },
          {
            upsert: true,
            returnDocument: 'after'
          }
        );
      })
    );

    return documents.map((document) => (document as WithId<Hashtag>)._id);
  }
}

const hashtagsService = new HashtagsService();

export default hashtagsService;
