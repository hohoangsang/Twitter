import { Collection, Db, MongoClient } from 'mongodb';
import { config } from 'dotenv';
import User from '~/models/schemas/user.schema';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import Follower from '~/models/schemas/follower.schema';
import StatusVideos from '~/models/schemas/statusVideos.schema';
import Tweet from '~/models/schemas/tweet.schema';
import Hashtag from '~/models/schemas/hashtag.schema';
import Bookmarks from '~/models/schemas/bookmark.shema';
import Like from '~/models/schemas/like.schema';

config();

const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.ieinxx3.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;

  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
  }

  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log('Pinged your deployment. You successfully connected to MongoDB!');
    } catch (error) {
      console.log(error);
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string);
  }

  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string);
  }

  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string);
  }

  get statusVideos(): Collection<StatusVideos> {
    return this.db.collection(process.env.DB_STATUS_VIDEOS_COLLECTION as string);
  }

  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string);
  }

  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string);
  }

  get bookmarks(): Collection<Bookmarks> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string);
  }

  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string);
  }

  async indexUsers() {
    const usersCollection = this.users;

    const existedIndexUsers = await usersCollection.indexExists([
      'email_1',
      'username_1',
      'email_1_password_1',
      'email_verify_token_1'
    ]);

    if (existedIndexUsers) return;

    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1, password: 1 });
    await usersCollection.createIndex({ email_verify_token: 1 });
  }

  async indexRefreshTokens() {
    const existedIndexRefreshTokens = await this.refreshToken.indexExists(['token_1', 'exp_1']);

    if (existedIndexRefreshTokens) return;

    await this.refreshToken.createIndex({ token: 1 });
    await this.refreshToken.createIndex(
      { exp: 1 },
      {
        expireAfterSeconds: 0
      }
    );
  }

  async indexFollowers() {
    const existedIndexFollowers = await this.followers.indexExists([
      'user_id_1_followed_user_id_1'
    ]);

    if (existedIndexFollowers) return;

    await this.followers.createIndex({ user_id: 1, followed_user_id: 1 });
  }

  async indexVideoStatus() {
    const existedIndexStatusVideo = await this.statusVideos.indexExists(['idName_1']);

    if (existedIndexStatusVideo) return;

    await this.statusVideos.createIndex({ idName: 1 }, { unique: true });
  }

  async indexHashtags() {
    const existedIndexHashtag = await this.hashtags.indexExists(['name_1', 'name_text']);

    if (existedIndexHashtag) return;

    await this.hashtags.createIndex({ name: 1 }, { unique: true });

    //option: { default_language: 'none' } dùng để disable "stop word" trong text search
    await this.hashtags.createIndex({ name: 'text' }, { default_language: 'none' });
  }

  async indexBookmark() {
    const existedIndexBookmark = await this.bookmarks.indexExists(['tweet_id_1_user_id_1']);

    if (existedIndexBookmark) return;

    await this.bookmarks.createIndex({ tweet_id: 1, user_id: 1 });
  }

  async indexLike() {
    const existedIndexLike = await this.likes.indexExists(['tweet_id_1_user_id_1']);

    if (existedIndexLike) return;

    await this.likes.createIndex({ tweet_id: 1, user_id: 1 });
  }

  async indexTweet() {
    const existedIndexTweet = await this.tweets.indexExists(['content_text']);

    if (existedIndexTweet) return;

    //option: { default_language: 'none' } dùng để disable "stop word" trong text search
    await this.tweets.createIndex({ content: 'text' }, { default_language: 'none' });
  }
}

//create object from class DatabaseService
const databaseService = new DatabaseService();

export default databaseService;
