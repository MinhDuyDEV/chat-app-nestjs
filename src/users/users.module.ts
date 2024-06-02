import { Module } from '@nestjs/common';
import { Services } from 'src/auth/utils/constants';
import { UserService } from './users.service';

@Module({
  providers: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
  ],
  exports: [
    {
      provide: Services.USERS,
      useClass: UserService,
    },
  ],
})
export class UsersModule {}
