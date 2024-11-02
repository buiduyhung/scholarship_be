import { Logger, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/chat/chat.service';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { ConversationOnlineGuard } from 'src/chat/guards/conversation-online.guard';
import { ConversationGuard } from 'src/chat/guards/conversation.guard';
import { GetConversation } from 'src/chat/guards/get-conversation.decorator';
import { UserWS } from 'src/chat/guards/get-ws-user.decorator';
import { WsGuard } from 'src/chat/guards/ws.guard';
import { ConversationDocument } from 'src/chat/schema/conversation.schema';
import { UserDocument } from 'src/users/schemas/user.schema';
export const UseChatSocketKey = {
  sendMessage: 'sendMessage',
  getConversations: 'getConversations',
  receiveMessage: 'receiveMessage',
  newConversation: 'newConversation',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/api/v1',
})
@UseGuards(WsGuard)
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}
  @WebSocketServer() server: Server;

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('connect')
  async handleConnection(client: Socket) {
    this.logger.log(client.id, 'Connected..............................');

    return 'Connected';
  }

  @SubscribeMessage(UseChatSocketKey.getConversations)
  async getConversations(
    client: Socket,
    data: any,
    @UserWS() user: UserDocument,
  ): Promise<any> {
    const conversation =
      await this.chatService.getUserCurrentConversation(user);

    return {
      data: conversation,
      status: 200,
    };
  }

  @SubscribeMessage(UseChatSocketKey.newConversation)
  async newConversation(
    client: Socket,
    data: any,
    @UserWS() user: UserDocument,
  ): Promise<any> {
    const staff = await this.chatService.getStaff();
    if (!staff) {
      return {
        status: 404,
        message: 'No staff available',
      };
    }
    const conversation = await this.chatService.createConversation(user, staff);

    return {
      data: conversation,
      status: 200,
    };
  }

  @SubscribeMessage(UseChatSocketKey.sendMessage)
  @UseGuards(ConversationGuard, ConversationOnlineGuard)
  async sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: CreateMessageDto,
    @UserWS() user: UserDocument,
    @GetConversation() conversation: ConversationDocument,
  ): Promise<Record<string, any>> {
    let msg = await this.chatService.createMessage(user, conversation, payload);

    msg = await this.chatService.populateMessage(msg);

    this.server
      .to(conversation._id.toString())
      .emit(UseChatSocketKey.receiveMessage, msg);

    return {
      data: msg,
      status: 200,
      message: 'Message sent',
    };
  }
}
