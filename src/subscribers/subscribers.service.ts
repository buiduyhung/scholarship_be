import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schemas';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {
  constructor(
    @InjectModel(Subscriber.name)
    private subscriberModel: SoftDeleteModel<SubscriberDocument>
  ) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { major, level, ielts, GPA, pay, value, location } = createSubscriberDto;
    const { email, name } = user

    const isExist = await this.subscriberModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} đã tồn tại!`)
    }

    let newSubs = await this.subscriberModel.create({
      name, email, major, level, ielts, GPA, pay, value, location,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newSubs?._id,
      createdAt: newSubs?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
    if (!mongoose.Types.ObjectId.isValid(id))
      throw new BadRequestException("not found Subscriber to find")

    return await this.subscriberModel.findOne({ _id: id })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    const updated = await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true } // neu khong co thi tao moi
    );
    return updated;
  }


  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException("not found subscriber to find")

    await this.subscriberModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
      })
    return this.subscriberModel.softDelete({
      _id
    });
  }

  async getSubject(user: IUser) {
    const { email } = user;
    return await this.subscriberModel.findOne(
      { email },
      { name: 1, major: 1, level: 1, location: 1, ielts: 1, GPA: 1, pay: 1, value: 1 }
    );
  }
}
