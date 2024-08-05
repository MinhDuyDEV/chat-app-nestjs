import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { IMessageService } from './messages';
import { CreateMessageParams } from 'src/utils/types';
import { Conversation, Message } from 'src/utils/typeorm';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
  ) {}

  async createMessage({
    user,
    content,
    conversationId,
  }: CreateMessageParams): Promise<Message> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient'],
    });
    if (!conversation)
      throw new HttpException('Conversation not found', HttpStatus.BAD_REQUEST);

    const { creator, recipient } = conversation;
    if (creator.id !== user.id && recipient.id !== user.id)
      throw new HttpException('Cannot Create Message', HttpStatus.FORBIDDEN);

    const newMessage = this.messageRepository.create({
      content,
      conversation,
      author: instanceToPlain(user),
    });
    conversation.lastMessageSent =
      await this.messageRepository.save(newMessage);
    await this.conversationRepository.save(conversation);
    return;
  }

  getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['author'],
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
    });
  }
}
