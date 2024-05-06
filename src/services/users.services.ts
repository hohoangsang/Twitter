import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';

class UsersService {
  async register(body: { email: string; password: string }) {
    const { email, password } = body;

    const result = await databaseService.users.insertOne(
      new User({
        email,
        password
      })
    );

    return result;
  }
}

const usersService = new UsersService();

export default usersService;
