import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { Repository } from 'typeorm';
import { IUserService } from './users';
import { User } from 'src/utils/typeorm';
import { hashPassword } from 'src/utils/helpers';
import { CreateUserDetails, FindUserParams } from 'src/utils/types';

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDetails: CreateUserDetails) {
    const existingUser = await this.userRepository.findOne({
      where: { email: userDetails.email },
    });
    if (existingUser)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);
    const password = await hashPassword(userDetails.password);
    const newUser = this.userRepository.create({ ...userDetails, password });
    return this.userRepository.save(newUser);
  }

  async findUser(findUserParams: FindUserParams): Promise<User> {
    return this.userRepository.findOne({
      where: { ...findUserParams },
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }
}
