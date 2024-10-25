import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateAdvisoryDto } from './dto/update-advisory.dto';
import { Advisory, AdvisoryDocument } from './schemas/advisory.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { CreateUserAdvisoryDto } from './dto/create-advisory.dto';
import aqp from 'api-query-params';


@Injectable()
export class AdvisoryService {
  constructor(
    @InjectModel(Advisory.name)
    private advisoryModel: SoftDeleteModel<AdvisoryDocument>,
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,

  ) { }

  async create(createUserAdvisoryDto: CreateUserAdvisoryDto) {
    const { emailAdvisory, fullName, phone, address } = createUserAdvisoryDto;

    const newAd = await this.advisoryModel.create({
      emailAdvisory, fullName, phone, address,
      status: "PENDING",
      createdBy: emailAdvisory,
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: null,
            email: null,
          }
        }
      ]
    })

    return {
      _id: newAd?._id,
      createdAt: newAd?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.advisoryModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.advisoryModel.find(filter)
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
      throw new BadRequestException("not found advisory")
    }
    return await this.advisoryModel.findById(id);
  }


  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found advisory")
    }

    const updated = await this.advisoryModel.updateOne(
      { _id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      });

    return updated;
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException("not found resume")

    await this.advisoryModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
      })
    return this.advisoryModel.softDelete({
      _id
    });
  }
}
