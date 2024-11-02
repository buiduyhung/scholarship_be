import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { ConversationDocument } from 'src/chat/schema/conversation.schema';
import { MessageDocument } from 'src/chat/schema/message.schema';
import { UserDocument } from 'src/users/schemas/user.schema';

export interface IChatService {
  createConversation(
    user: Pick<UserDocument, '_id'>,
    staff: Pick<UserDocument, '_id'>,
  ): Promise<ConversationDocument>;

  getUserCurrentConversation(
    user: Pick<UserDocument, '_id'>,
  ): Promise<ConversationDocument>;

  getConversations(
    user: Pick<UserDocument, '_id'>,
  ): Promise<Record<string, any>>;

  getConversationById(
    conversationId: string,
  ): Promise<ConversationDocument | null>;

  createMessage(
    user: Pick<UserDocument, '_id'>,
    conversation: Pick<ConversationDocument, '_id'>,
    payload: CreateMessageDto,
  ): Promise<MessageDocument>;

  closeConversation(conversationId: string): Promise<ConversationDocument>;

  getStaff(): Promise<UserDocument>;
}
