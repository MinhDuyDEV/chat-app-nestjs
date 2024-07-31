import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IAuthService } from './auth';
import { ValidateUserDetails } from 'src/utils/types';
import { IUserService } from 'src/users/users';
import { Services } from '../utils/constants';
import { compareHash } from 'src/utils/helpers';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(userDetails: ValidateUserDetails) {
    const user = await this.userService.findUser({
      email: userDetails.email,
    });
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);
    const isPasswordValid = compareHash(userDetails.password, user.password);
    return isPasswordValid ? user : null;
  }
}
