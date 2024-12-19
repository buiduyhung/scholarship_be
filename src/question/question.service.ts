import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Question, QuestionDocument } from './schemas/question.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class QuestionService {
  constructor(
    @InjectModel(Question.name)
    private questionModel: SoftDeleteModel<QuestionDocument>,
  ) { }

  async create(createQuestionDto: CreateQuestionDto, user: IUser) {
    const {
      question, option, answer, quiz,
    } = createQuestionDto;

    let newQuestion = await this.questionModel.create({
      question, option, answer, quiz,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newQuestion?._id,
      createdAt: newQuestion?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.questionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.questionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found question`;
    }
    return await this.questionModel.findById(id)
  }


  async update(id: string, updateQuestionDto: UpdateQuestionDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found question`;
    const updated = await this.questionModel.updateOne(
      { _id: id },
      {
        ...updateQuestionDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found question`;
    await this.questionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.questionModel.softDelete({
      _id: id
    })
  }
}
