import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/create-user.dto';
import { Routes, Services } from '../utils/constants';
import { IUserService } from 'src/users/users';
import { instanceToPlain } from 'class-transformer';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';
import { Request, Response } from 'express';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return instanceToPlain(await this.userService.createUser(createUserDto));
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Res() res: Response) {
    return res.send(HttpStatus.OK);
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  status(@Req() req: Request, @Res() res: Response) {
    res.send(req.user);
  }

  @Post('logout')
  logout() {}
}
