import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ChatService } from 'src/chat/chat.service';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@ApiTags('chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  @ResponseMessage('Get all conversations')
  async findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
    @User() user: IUser,
  ) {
    return this.chatService.getConversations(user as any, {
      currentPage: +currentPage,
      limit: +limit,
      qs,
    });
  }

  @Get('/latest')
  @ResponseMessage('Get latest conversation')
  async getLatestConversation(@User() user: IUser) {
    return this.chatService.getUserCurrentConversation(user as any);
  }

  @Get('/:id')
  @ResponseMessage('Get conversation by id')
  async getConversationById(@User() user: IUser, @Param('id') id: string) {
    return this.chatService.getConversationById(id);
  }

  @Get('/:id/messages')
  @ResponseMessage('Get messages of conversation')
  async getConversationMessages(@User() user: IUser, @Param('id') id: string) {
    return this.chatService.getMessages(id);
  }
}
