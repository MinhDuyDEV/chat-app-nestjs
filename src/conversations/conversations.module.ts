import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Services } from 'src/utils/constants';
import { UsersModule } from 'src/users/users.module';
import { Conversation, Participant } from 'src/utils/typeorm';
import { ConversationsService } from './conversations.service';
import { ConversationsController } from './conversations.controller';
import { ParticipantsModule } from 'src/participants/participants.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Participant]),
    ParticipantsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: Services.CONVERSATIONS,
      useClass: ConversationsService,
    },
  ],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
