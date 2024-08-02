import { Body, Controller, Inject, Post } from '@nestjs/common';

import { User } from 'src/utils/typeorm';
import { IMessageService } from './messages';
import { Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { CreateMessageDto } from './dtos/CreateMessage.dto';

@Controller('messages')
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
  ) {}

  @Post()
  createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    return this.messageService.createMessage({ ...createMessageDto, user });
  }
}
