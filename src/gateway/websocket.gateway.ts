import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class MessagingGateway implements OnGatewayConnection {
  handleConnection(client: Socket, ...args: any[]) {
    console.log('Client connected');
    console.log("Client's id: ", client.id);
    console.log('args: ', args);
    client.emit('connected', { status: 'good' });
  }

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('createMessage')
  handleCreateMessage(@MessageBody() data: any) {
    console.log('🚀 ~ MessagingGateway ~ handleCreateMessage ~ data:', data);
    console.log('Create Message');
  }

  @OnEvent('message.create')
  handleMessageCreateEvent(payload: any) {
    console.log('Inside message.create');
    console.log(
      '🚀 ~ MessagingGateway ~ handleMessageCreateEvent ~ payload:',
      payload,
    );
    this.server.emit('onMessage', payload);
  }
}
