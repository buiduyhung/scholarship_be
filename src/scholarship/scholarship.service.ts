import { Injectable } from '@nestjs/common';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Scholarship, ScholarshipDocument } from './schemas/scholarship.schemas';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ScholarshipService {
  constructor(@InjectModel(Scholarship.name)
  private scholarshipModel: SoftDeleteModel<ScholarshipDocument>

  ) { }
  async create(createScholarshipDto: CreateScholarshipDto, user: IUser) {
    const {
      name, fundingMethod, provider, location, level, value, quantity,
      description, type, startDate, endDate, isActive
    } = createScholarshipDto;

    let newScholarship = await this.scholarshipModel.create({
      name, fundingMethod, provider, location, level, value, quantity,
      description, type, startDate, endDate, isActive,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newScholarship?._id,
      createdAt: newScholarship?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.scholarshipModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.scholarshipModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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
      return `not found scholarship`;

    return await this.scholarshipModel.findById(id);
  }

  async update(id: string, updateScholarshipDto: UpdateScholarshipDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found scholarship`;
    const updated = await this.scholarshipModel.updateOne(
      { _id: id },
      {
        ...updateScholarshipDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }
  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found scholarship`;
    await this.scholarshipModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.scholarshipModel.softDelete({
      _id: id
    })
  }
}
