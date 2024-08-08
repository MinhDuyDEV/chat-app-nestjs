import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
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
  async createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    await this.messageService.createMessage({
      ...createMessageDto,
      user,
    });
    return;
  }

  @Get(':conversationId')
  async getMessagesFromConversation(
    @Param('conversationId', ParseIntPipe) conversationId: number,
  ) {
    const messages =
      await this.messageService.getMessagesByConversationId(conversationId);
    return { id: conversationId, messages };
  }
}
