import User from '~/models/schemas/user.schema';
import databaseService from '~/services/database.services';

class UsersService {
  async register(body: { email: string; password: string; name: string; date_of_birth?: string }) {
    const { email, password, name, date_of_birth } = body;

    const result = await databaseService.users.insertOne(
      new User({
        email,
        password,
        name,
        date_of_birth: date_of_birth ? new Date(date_of_birth) : undefined
      })
    );

    return result;
  }
}

const usersService = new UsersService();

export default usersService;
