import { Injectable } from '@nestjs/common';
import { CreateUserDetails } from 'src/auth/utils/types';
import { IUserService } from './users';

@Injectable()
export class UserService implements IUserService {
  createUser(userDetails: CreateUserDetails) {
    console.log('🚀 ~ UserService ~ createUser ~ userDetails:', userDetails);
  }
}
