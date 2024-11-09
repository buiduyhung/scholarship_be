import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Quiz, QuizDocument } from './schemas/quiz.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(Quiz.name)
    private quizModel: SoftDeleteModel<QuizDocument>,
  ) { }

  async create(createQuizDto: CreateQuizDto, user: IUser) {
    const {
      title, description, question, type
    } = createQuizDto;

    let newQuiz = await this.quizModel.create({
      title, description, question, type,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newQuiz?._id,
      createdAt: newQuiz?.createdAt
    }
  }


  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.quizModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.quizModel.find(filter)
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
      throw new BadRequestException("not found quiz to find")
    }
    return (await this.quizModel.findById(id))
      .populate({
        path: "question", select: { _id: 1, question: 1, option: 1, answer: 1 } //-1 is off
      });
  }


  async update(id: string, updateQuizDto: UpdateQuizDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found quiz`;
    const updated = await this.quizModel.updateOne(
      { _id: id },
      {
        ...updateQuizDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found quiz`;
    await this.quizModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.quizModel.softDelete({
      _id: id
    })
  }
}
