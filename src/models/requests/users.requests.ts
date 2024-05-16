import { TokenType } from '~/constants/enum';

export type RegisterBody = {
  name: string;
  email: string;
  date_of_birth: string;
  password: string;
  confirm_password: string;
};

export type LogoutBody = {
  refresh_token: string;
};