import { Controller, Get, Param, Put, Query } from '@nestjs/common';
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

  @Get('/:id')
  @ResponseMessage('Get conversation by id')
  async getConversationById(@User() user: IUser, @Param('id') id: string) {
    return this.chatService.getConversationById(id);
  }

  @Put('/:id')
  @ResponseMessage('Update conversation')
  async updateConversation(@User() user: IUser, @Param('id') id: string) {
    return this.chatService.closeConversation(id);
  }

  @Get('/:id/messages')
  @ResponseMessage('Get messages of conversation')
  async getConversationMessages(
    @User() user: IUser,
    @Param('id') id: string,
    @Query() qs: string,
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
  ) {
    return this.chatService.getMessages(id, {
      currentPage: +currentPage,
      pageSize: +limit,
      qs,
    });
  }
}
