import { OnEvent } from '@nestjs/event-emitter';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { CreateMessageResponse } from 'src/utils/types';

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

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: CreateMessageResponse) {
    this.server.emit('onMessage', payload);
  }
}
