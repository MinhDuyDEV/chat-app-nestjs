import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnEvent } from '@nestjs/event-emitter';

import { Conversation } from 'src/utils/typeorm';
import { CreateMessageResponse } from 'src/utils/types';
import { AuthenticatedSocket } from 'src/utils/interfaces';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: Socket) {
    client.emit('connected', { status: 'good' });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('onClientConnect')
  onClientConnect(
    @MessageBody() data: any,
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    console.log('onClientConnect');
    console.log('🚀 ~ MessagingGateway ~ data:', data);
    console.log('🚀 ~ MessagingGateway ~ client:', client.user);
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: CreateMessageResponse) {
    this.server.emit('onMessage', payload);
  }

  @OnEvent('conversation.create')
  handleConversationCreateEvent(payload: Conversation) {
    this.server.emit('onConversation', payload);
  }
}
