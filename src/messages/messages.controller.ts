import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { User } from 'src/utils/typeorm';
import { IMessageService } from './messages';
import { Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { CreateMessageDto } from './dtos/CreateMessage.dto';

@Controller('messages')
@UseGuards(AuthenticatedGuard)
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

  @Get(':conversationId')
  getMessagesFromConversation(@Param('conversationId') conversationId: number) {
    return this.messageService.getMessagesByConversationId(conversationId);
  }
}
