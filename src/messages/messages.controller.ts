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
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('messages')
@UseGuards(AuthenticatedGuard)
export class MessagesController {
  constructor(
    @Inject(Services.MESSAGES) private readonly messageService: IMessageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createMessage(
    @AuthUser() user: User,
    @Body() createMessageDto: CreateMessageDto,
  ) {
    const message = await this.messageService.createMessage({
      ...createMessageDto,
      user,
    });
    this.eventEmitter.emit('message.create', message);
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
