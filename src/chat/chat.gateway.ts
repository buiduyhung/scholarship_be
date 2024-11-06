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
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UserDocument } from 'src/users/schemas/user.schema';
export const UseChatSocketKey = {
  sendMessage: 'sendMessage',
  getConversations: 'getConversations',
  receiveMessage: 'receiveMessage',
  newConversation: 'newConversation',
  connection: 'connection',
};

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/api/v1',
})
@UseGuards(WsGuard)
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly cloudinary: CloudinaryService,
  ) {}
  @WebSocketServer() server: Server;

  private logger = new Logger('ChatGateway');

  @SubscribeMessage('connect')
  async handleConnection(@ConnectedSocket() client: Socket) {
    this.logger.debug('Connected with id: ' + client.id);
    const roomId = client.handshake.query.roomId;
    if (roomId !== undefined) {
      client.join(roomId);
      this.logger.debug('Client join room: ' + roomId);
      this.server.emit(
        UseChatSocketKey.connection,
        'Connected to room ' + roomId,
      );
    }
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
    @ConnectedSocket() client: Socket,
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

    client.join(conversation._id.toString());
    this.logger.debug(
      `User ${user.email} create new conversation with staff ${staff.email}`,
    );

    return {
      data: conversation,
      status: 200,
    };
  }

  @SubscribeMessage(UseChatSocketKey.sendMessage)
  @UseGuards(ConversationGuard, ConversationOnlineGuard)
  async sendMessage(
    @MessageBody() payload: CreateMessageDto,
    @UserWS() user: UserDocument,
    @GetConversation() conversation: ConversationDocument,
  ): Promise<Record<string, any>> {
    this.logger.debug(
      `User ${user.email} send message to conversation ${conversation._id}: ${payload.text}`,
    );
    const payloadFiles = [];
    if (payload.files && payload.files.length > 0) {
      const links = await Promise.all(
        payload.files.map(async (file) => {
          const link = await this.cloudinary.uploadByBuffer(
            {
              buffer: file.buffer,
              originalname: file.name,
            },
            {
              folder: 'chat',
            },
          );
          payloadFiles.push(link);
          return link;
        }),
      );

      links.forEach((link, index) => {
        payloadFiles[index] = link.url;
      });
    }
    // log out files in payload

    let msg = await this.chatService.createMessage(user, conversation, {
      ...payload,
      files: payloadFiles,
    });

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
