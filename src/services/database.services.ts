import { Collection, Db, MongoClient } from 'mongodb';
import { config } from 'dotenv';
import User from '~/models/schemas/user.schema';
import RefreshToken from '~/models/schemas/refreshToken.schema';
import Follower from '~/models/schemas/follower.schema';

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

  get follower(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTIONS as string);
  }

  async indexUsers() {
    const usersCollection = this.users;

    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ username: 1 }, { unique: true });
    await usersCollection.createIndex({ email: 1, password: 1 });
    await usersCollection.createIndex({ email_verify_token: 1 });
  }
}

//create object from class DatabaseService
const databaseService = new DatabaseService();

export default databaseService;
