import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';

import { User } from 'src/utils/typeorm';
import { AuthUser } from 'src/utils/decorators';
import { Routes, Services } from 'src/utils/constants';
import { IConversationsService } from './conversations';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { CreateConversationDto } from './dtos/CreateConversation.dto';

@Controller(Routes.CONVERSATIONS)
@UseGuards(AuthenticatedGuard)
export class ConversationsController {
  constructor(
    @Inject(Services.CONVERSATIONS)
    private readonly conversationsService: IConversationsService,
  ) {}

  @Post()
  async createConversation(
    @AuthUser() user: User,
    @Body() createConversationPayload: CreateConversationDto,
  ) {
    return this.conversationsService.createConversation(
      user,
      createConversationPayload,
    );
  }
}
