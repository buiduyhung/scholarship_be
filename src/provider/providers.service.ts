import { Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-providers.dto';
import { UpdateProviderDto } from './dto/update-providers.dto';
import { Provider, ProviderDocument } from './schemas/providers.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ProviderService {
  constructor(@InjectModel(Provider.name)
  private providerModel: SoftDeleteModel<ProviderDocument>
  ) { }

  create(createProviderDto: CreateProviderDto, user: IUser) {
    return this.providerModel.create({
      ...createProviderDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.providerModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.providerModel.find(filter)
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
      return `not found provider`;
    return await this.providerModel.findOne({
      _id: id
    })
  }

  async update(id: string, updateProviderDto: UpdateProviderDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found provider`;
    return await this.providerModel.updateOne(
      { _id: id },
      {
        ...updateProviderDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found provider`;
    await this.providerModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.providerModel.softDelete({
      _id: id
    })
  }
}
