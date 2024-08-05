import { Repository } from 'typeorm';
import { plainToClass } from 'class-transformer';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { Services } from 'src/utils/constants';
import { IUserService } from 'src/users/users';
import { Conversation, User } from 'src/utils/typeorm';
import { IConversationsService } from './conversations';
import { CreateConversationParams } from 'src/utils/types';

@Injectable()
export class ConversationsService implements IConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @Inject(Services.USERS)
    private readonly userService: IUserService,
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
      .leftJoin('conversation.lastMessageSent', 'lastMessageSent')
      .addSelect([
        'lastMessageSent.id',
        'lastMessageSent.content',
        'lastMessageSent.createdAt',
      ])
      .where('creator.id = :id', { id })
      .orWhere('recipient.id = :id', { id })
      .orderBy('conversation.id', 'DESC')
      .getMany();
  }

  async findConversationById(id: number): Promise<Conversation> {
    return this.conversationRepository.findOne({
      where: { id },
    });
  }

  async createConversation(user: User, params: CreateConversationParams) {
    const { recipientId } = params;

    if (user.id === params.recipientId)
      throw new HttpException(
        'Cannot Create Conversation',
        HttpStatus.BAD_REQUEST,
      );

    const existingConversation = await this.conversationRepository.findOne({
      where: [
        {
          creator: { id: user.id },
          recipient: { id: recipientId },
        },
        {
          creator: { id: recipientId },
          recipient: { id: user.id },
        },
      ],
      relations: ['creator', 'recipient'],
    });

    if (existingConversation)
      throw new HttpException('Conversation exists', HttpStatus.CONFLICT);
    const recipient = await this.userService.findUser({ id: recipientId });

    if (!recipient)
      throw new HttpException('Recipient not found', HttpStatus.BAD_REQUEST);

    const conversation = this.conversationRepository.create({
      creator: user,
      recipient: recipient,
    });

    return plainToClass(
      Conversation,
      this.conversationRepository.save(conversation),
    );
  }
}
