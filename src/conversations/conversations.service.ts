import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Services } from 'src/utils/constants';
import { IUserService } from 'src/users/users';
import { Conversation, User } from 'src/utils/typeorm';
import { IConversationsService } from './conversations';
import { CreateConversationParams } from 'src/utils/types';
import { IMessageService } from 'src/messages/messages';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.USERS)
    private readonly userService: IUserService,
    @Inject(Services.MESSAGES)
    private readonly messageService: IMessageService,
  ) {}

  async getConversations(id: number): Promise<Conversation[]> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoin('conversation.creator', 'creator')
      .addSelect([
        'creator.id',
        'creator.firstName',
        'creator.lastName',
        'creator.email',
      ])
      .leftJoin('conversation.recipient', 'recipient')
      .addSelect([
        'recipient.id',
        'recipient.firstName',
        'recipient.lastName',
        'recipient.email',
      ])
      .leftJoinAndSelect('conversation.lastMessageSent', 'lastMessageSent')
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('lastMessageSent.createdAt', 'DESC')
      .getMany();
  }

  async findConversationById(id: number): Promise<Conversation> {
    return this.conversationRepository.findOne({
      where: { id },
    });
  }

  async createConversation(user: User, params: CreateConversationParams) {
    const { email, message } = params;
    const existingRecipient = await this.userService.findUser({ email });
    if (!existingRecipient)
      throw new HttpException('Recipient not found', HttpStatus.BAD_REQUEST);
    const existingConversation = await this.conversationRepository.findOne({
      where: [
        {
          creator: { id: user.id },
          recipient: { id: existingRecipient.id },
        },
        {
          creator: { id: existingRecipient.id },
          recipient: { id: user.id },
        },
      ],
      relations: ['creator', 'recipient'],
    });
    if (existingConversation)
      throw new HttpException('Conversation exists', HttpStatus.CONFLICT);

    const newConversation = this.conversationRepository.create({
      creator: user,
      recipient: existingRecipient,
    });
    const savedConversation =
      await this.conversationRepository.save(newConversation);
    const lastMessageSent = await this.messageService.createMessage({
      content: message,
      conversationId: savedConversation.id,
      user,
    });
    return { ...savedConversation, lastMessageSent: lastMessageSent.message };
  }
}
