import User from '~/models/schemas/user.schema';
import { RegisterBody } from '~/models/users/register';
import databaseService from '~/services/database.services';
import { hashPassword } from '~/utils/crypto';

class UsersService {
  async register(body: RegisterBody) {
    const result = await databaseService.users.insertOne(
      new User({
        ...body,
        date_of_birth: new Date(body.date_of_birth),
        password: hashPassword(body.password)
      })
    );

    return result;
  }

  async checkExistEmail(email: string) {
    const result = await databaseService.users.findOne({ email });
    return Boolean(result);
  }
}

const usersService = new UsersService();

export default usersService;
