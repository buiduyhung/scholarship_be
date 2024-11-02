import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { find } from 'rxjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { IChatService } from 'src/chat/interfaces/chat.service.interface';
import {
  Conversation,
  ConversationDocument,
} from 'src/chat/schema/conversation.schema';
import { Message, MessageDocument } from 'src/chat/schema/message.schema';
import { UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: SoftDeleteModel<ConversationDocument>,
    private userService: UsersService,
  ) {}
  closeConversation(conversationId: string): Promise<ConversationDocument> {
    return this.conversationModel.findByIdAndUpdate(
      conversationId,
      {
        status: false,
      },
      { new: true },
    );
  }
  async getStaff(): Promise<UserDocument> {
    const users = await this.userService.findUsersByRole('ADMIN');

    const random = Math.floor(Math.random() * users.length);

    return users[random];
  }
  createConversation(
    user: Pick<UserDocument, '_id'>,
    staff: Pick<UserDocument, '_id'>,
  ): Promise<ConversationDocument> {
    return this.conversationModel.create({
      user: user._id,
      staff: staff._id,
      messages: [],
      status: true,
      createdAt: new Date(),
    });
  }
  getUserCurrentConversation(
    user: Pick<UserDocument, '_id'>,
  ): Promise<ConversationDocument> {
    // Get the latest conversation of the user, which is not closed
    return this.conversationModel.findOne(
      {
        user: user._id,
        status: true,
      },
      { populate: 'staff, user' },
      {
        projection: {
          'staff.id': 1,
          'staff.email': 1,
          'user.id': 1,
          'user.email': 1,
        },
        sort: { createdAt: -1 },
      },
    );
  }
  async getConversations(
    user: Pick<UserDocument, '_id'>,
    options?: {
      currentPage: number;
      limit: number;
      qs: string;
    },
  ): Promise<Record<string, any>> {
    const { filter, sort, population, projection } = aqp(options.qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+options.currentPage - 1) * +options.limit;
    let defaultLimit = +options.limit ? +options.limit : 10;

    const totalItems = (
      await this.conversationModel.find({ ...filter, user: user._id })
    ).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.conversationModel
      .find(
        {
          ...find,
          user: user._id,
        },
        {
          sort: { createdAt: -1 },
        },
      )
      .populate(population)
      .populate('staff', 'id email')
      .populate('user', 'id email')
      .select('id status createdAt messages')
      .select(projection)
      .skip(offset)
      .limit(defaultLimit);
    return {
      meta: {
        current: options.currentPage, //trang hiện tại
        pageSize: options.limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }
  getConversationById(conversationId: string): Promise<any> {
    return this.conversationModel
      .findById(new mongoose.Types.ObjectId(conversationId))
      .populate('staff', 'id email')
      .populate('user', 'id email');
  }

  async getMessages(
    conversationId: string,
    options?: {
      currentPage: number;
      limit: number;
      qs: string;
    },
  ) {
    const { filter, sort, population, projection } = aqp(options?.qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+options?.currentPage - 1) * +options?.limit;
    let defaultLimit = +options?.limit ? +options?.limit : 10;

    const totalItems = await this.messageModel
      .find({
        ...filter,
        conversation: conversationId,
      })
      .countDocuments();

    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.messageModel
      .find(
        {
          ...filter,
          conversation: conversationId,
        },
        {
          sort: { sentAt: -1 },
        },
      )
      .populate(population)
      .populate('sender', 'id email')
      .select('id text files sentAt')
      .select(projection)
      .skip(offset)
      .limit(defaultLimit)
      .exec();

    return {
      meta: {
        current: options?.currentPage, //trang hiện tại
        pageSize: options?.limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }
  async createMessage(
    user: Pick<UserDocument, '_id'>,
    conversation: Pick<ConversationDocument, '_id'>,
    payload: CreateMessageDto,
  ): Promise<MessageDocument> {
    const message = await this.messageModel.create({
      sender: user._id,
      text: payload.text,
      files: payload.files,
      conversation: conversation._id,
      sentAt: new Date(),
      updateAt: new Date(),
    });

    await this.conversationModel.findByIdAndUpdate(
      conversation._id,
      {
        $push: { messages: message },
      },
      { new: true },
    );

    return message;
  }

  async populateMessage(message: MessageDocument): Promise<MessageDocument> {
    return message.populate({
      path: 'sender',
      localField: 'sender',
      foreignField: '_id',
      select: 'id email',
    });
  }
}
