import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProviderDto } from './dto/create-providers.dto';
import { UpdateProviderDto } from './dto/update-providers.dto';
import { Provider, ProviderDocument } from './schemas/providers.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from 'src/users/schemas/user.schema';

@Injectable()
export class ProviderService {
  constructor(@InjectModel(Provider.name)
  private providerModel: SoftDeleteModel<ProviderDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>
  ) { }

  async create(createProviderDto: CreateProviderDto, user: IUser) {

    const { name } = createProviderDto;

    const isExist = await this.providerModel.findOne({ name });

    if (isExist) {
      throw new BadRequestException(`Name provider: ${name} already exists. Please use a different name provider.`);
    }

    return await this.providerModel.create({
      ...createProviderDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async findAll(currentPage: number, limit: number, qs: string, userId?: string) {
    // Bước 1: Kiểm tra xem userId có được cung cấp không
    if (userId) {
      // Lấy thông tin user từ userModel và chỉ chọn trường provider
      const user = await this.userModel.findById(userId).select('provider');
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Tìm provider bằng ObjectId trong user.provider
      const provider = await this.providerModel.findById(user.provider);
      if (!provider) {
        throw new BadRequestException(`Provider with ID ${user.provider} not found`);
      }

      // Loại bỏ `userId` khỏi `qs` nếu nó tồn tại
      const queryParams = new URLSearchParams(qs);
      queryParams.delete('userId');

      // Gán providerId vào filter để chỉ lấy các providers liên quan đến user
      queryParams.append('_id', provider._id.toString());
      qs = queryParams.toString();
    }

    // Kiểm tra lại nội dung của query string sau khi thêm provider ID
    console.log("Query String:", qs);

    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    console.log("Filter:", filter); // Log để kiểm tra filter

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    // Đếm tổng số lượng bản ghi phù hợp với filter
    const totalItems = await this.providerModel.countDocuments(filter);
    console.log("Total Items:", totalItems); // Log số lượng bản ghi tìm thấy
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Lấy danh sách provider dựa trên filter và phân trang
    const result = await this.providerModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    console.log("Result:", result); // Log kết quả để kiểm tra

    return {
      meta: {
        current: currentPage, // trang hiện tại
        pageSize: limit, // số lượng bản ghi đã lấy
        pages: totalPages, // tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result // kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`not found provider with id ${id}`);
    }
    return await this.providerModel.findById(id);
  }

  async update(id: string, updateProviderDto: UpdateProviderDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found provider`;
    }
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
