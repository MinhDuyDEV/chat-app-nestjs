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
import { AuthUser } from 'src/utils/decorators';
import { Routes, Services } from 'src/utils/constants';
import { IConversationsService } from './conversations';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { CreateConversationDto } from './dtos/CreateConversation.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    const conversation = await this.conversationsService.createConversation(
      user,
      createConversationPayload,
    );
    this.eventEmitter.emit('conversation.create', conversation);
    return conversation;
  }

  @Get()
  async getConversations(@AuthUser() { id }: User) {
    return this.conversationsService.getConversations(id);
  }

  @Get(':id')
  async getConversationById(@Param('id') id: number) {
    return await this.conversationsService.findConversationById(id);
  }
}
