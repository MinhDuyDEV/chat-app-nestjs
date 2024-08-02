import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Services } from 'src/utils/constants';
import { MessagesService } from './messages.service';
import { Conversation, Message } from 'src/utils/typeorm';
import { MessagesController } from './messages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Message, Conversation])],
  providers: [
    {
      provide: Services.MESSAGES,
      useClass: MessagesService,
    },
  ],
  controllers: [MessagesController],
})
export class MessagesModule {}
