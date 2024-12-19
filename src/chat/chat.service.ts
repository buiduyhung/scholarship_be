import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { FilterQuery, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { CreateMessageDto } from 'src/chat/dto/create-message.dto';
import { IChatService } from 'src/chat/interfaces/chat.service.interface';
import {
  Conversation,
  ConversationDocument,
} from 'src/chat/schema/conversation.schema';
import { Message, MessageDocument } from 'src/chat/schema/message.schema';
import { UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ChatService implements IChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: SoftDeleteModel<MessageDocument>,
    @InjectModel(Conversation.name)
    private conversationModel: SoftDeleteModel<ConversationDocument>,
    private userService: UsersService,
  ) { }
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
    const users = await this.userService.findUsersByRole('Staff');

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
    user: IUser,
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
    const query: FilterQuery<any> =
      user.role.name.toUpperCase() === 'SUPER_ADMIN' || user.role.name.toUpperCase() === 'Staff'
        ? {}
        : {
          $or: [
            { user: new Types.ObjectId(user._id) },
            { staff: new Types.ObjectId(user._id) },
          ],
        };
    // const result = await this.conversationModel
    //   .find({
    //     ...find,
    //     ...query,
    //   })
    //   .sort({ ...sort } as any)
    //   .populate(population)
    //   .populate('staff', 'id email avatar')
    //   .populate('user', 'id email avatar')
    //   .select('id status createdAt messages')
    //   .select(projection)
    //   .skip(offset)
    //   .limit(defaultLimit);
    const result = await this.conversationModel.aggregate([
      {
        $match: {
          ...query,
          ...filter,
        },
      },
      {
        $sort: {
          ...sort,
          createdAt: -1,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'staff',
          foreignField: '_id',
          as: 'staff',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $unwind: '$staff',
      },
      {
        $lookup: {
          from: 'messages',
          localField: '_id',
          foreignField: 'conversation',
          as: 'messages',
          pipeline: [
            {
              $sort: {
                createdAt: -1,
              },
            },
            {
              $limit: 1,
            },
          ],
        },
      },
      {
        $project: {
          ...projection,
          id: 1,
          status: 1,
          createdAt: 1,
          messages: 1,
          staff: { _id: 1, email: 1, avatar: 1 },
          user: { _id: 1, email: 1, avatar: 1 },
        },
      },
      {
        $skip: offset,
      },
      {
        $limit: defaultLimit,
      },
    ]);

    return {
      meta: {
        current: +options.currentPage, //trang hiện tại
        pageSize: +options.limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }
  getConversationById(conversationId: string): Promise<any> {
    return this.conversationModel
      .findById(new mongoose.Types.ObjectId(conversationId))
      .populate('staff', 'id email avatar')
      .populate('user', 'id email avatar');
  }

  async getMessages(
    conversationId: string,
    options?: {
      currentPage: number;
      pageSize: number;
      qs: string;
    },
  ) {
    const { filter, population, projection } = aqp(options?.qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+options?.currentPage - 1) * +options?.pageSize;
    let defaultLimit = +options?.pageSize ? +options?.pageSize : 10;

    const totalItems = await this.messageModel
      .find({
        ...filter,
        conversation: conversationId,
      })
      .countDocuments();

    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.messageModel
      .find({
        ...filter,
        conversation: conversationId,
      })
      .populate(population)
      .populate('sender', 'id email avatar')
      .select('id text files sentAt')
      .select(projection)
      .skip(offset)
      .sort({ sentAt: -1 })
      .limit(defaultLimit)
      .exec();

    return {
      meta: {
        current: +options?.currentPage, //trang hiện tại
        pageSize: +options?.pageSize, //số lượng bản ghi đã lấy
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
      select: 'id email avatar',
    });
  }
}
