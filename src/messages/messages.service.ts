import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

import { IMessageService } from './messages';
import { CreateMessageParams, CreateMessageResponse } from 'src/utils/types';
import { Conversation, Message } from 'src/utils/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class MessagesService implements IMessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createMessage({
    user,
    content,
    conversationId,
  }: CreateMessageParams): Promise<CreateMessageResponse> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId },
      relations: ['creator', 'recipient', 'lastMessageSent'],
      select: {
        creator: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        recipient: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
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
    const savedMessage = await this.messageRepository.save(newMessage);
    conversation.lastMessageSent = savedMessage;
    await this.conversationRepository.save(conversation);
    const updatedConversation =
      await this.conversationRepository.save(conversation);
    this.eventEmitter.emit('message.create', {
      message: savedMessage,
      conversation: updatedConversation,
    });
    return { message: savedMessage, conversation: updatedConversation };
  }

  getMessagesByConversationId(conversationId: number): Promise<Message[]> {
    return this.messageRepository.find({
      relations: ['author'],
      where: { conversation: { id: conversationId } },
      order: { createdAt: 'ASC' },
      select: {
        author: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    });
  }
}
