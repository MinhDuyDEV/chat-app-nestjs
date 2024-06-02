import { CreateUserDetails } from 'src/auth/utils/types';

export interface IUserService {
  createUser(userDetails: CreateUserDetails);
}
