import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Scholarship, ScholarshipDocument } from './schemas/scholarship.schemas';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { Provider } from 'src/provider/schemas/providers.schemas';
import { User } from 'src/users/schemas/user.schema'; // Add this import

@Injectable()
export class ScholarshipService {
  constructor(
    @InjectModel(Scholarship.name)
    private scholarshipModel: SoftDeleteModel<ScholarshipDocument>,
    @InjectModel(Provider.name)
    private providerModel: mongoose.Model<Provider>,
    @InjectModel(User.name) // Add this line
    private userModel: mongoose.Model<User> // Add this line
  ) { }
  async create(createScholarshipDto: CreateScholarshipDto, user: IUser) {
    const {
      name, continent, level, quantity, major, location, image,
      description, isActive
    } = createScholarshipDto;

    let newScholarship = await this.scholarshipModel.create({
      name, continent, level, quantity, major, location, image,
      description, isActive,
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

  // async getlocation(continentName: string): Promise<string[]> {
  //   // Truy vấn tất cả các location duy nhất theo continentName
  //   const uniqueLocations = await this.scholarshipModel
  //     .find({ continent: continentName }) // Lọc theo continentName
  //     .distinct('location'); // Lấy các location duy nhất

  //   return uniqueLocations;
  // }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.scholarshipModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.scholarshipModel.find(filter)
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
      return `not found scholarship`;
    }
    return await this.scholarshipModel.findById(id)
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

  async getListLocation(): Promise<Record<string, string[]>> {
    // Truy vấn tất cả các học bổng và chỉ lấy các trường continent và location
    const scholarships = await this.scholarshipModel.find().select('continent location -_id').exec();

    // Sử dụng reduce để nhóm location theo continent và loại bỏ các location trùng lặp
    const continentLocations = scholarships.reduce((acc, scholarship) => {
      const continent = scholarship.continent;
      const location = scholarship.location;

      // Nếu continent chưa tồn tại trong acc, khởi tạo mảng rỗng
      if (!acc[continent]) {
        acc[continent] = [];
      }

      // Thêm location vào mảng nếu chưa tồn tại
      if (!acc[continent].includes(location)) {
        acc[continent].push(location);
      }

      return acc;
    }, {} as Record<string, string[]>);

    return continentLocations;
  }

  // async searchByProvider(id: string) {
  //   // Ensure the id is a valid ObjectId
  //   if (!mongoose.Types.ObjectId.isValid(id)) {
  //     throw new BadRequestException("Invalid provider ID");
  //   }

  //   // Find the provider by its _id field
  //   const provider = await this.providerModel.findById(id);

  //   // Check if provider exists
  //   if (!provider) {
  //     throw new BadRequestException("Provider not found");
  //   }

  //   // Find all scholarships associated with the provider
  //   const scholarships = await this.scholarshipModel.find({
  //     provider: provider._id
  //   })
  //     .select('name location level') // Select only the name, location, and level fields
  //     .populate({
  //       path: 'provider',
  //       select: '_id logo' // Populate provider with only _id and logo
  //     })
  //     .exec();

  //   return scholarships;
  // }
}
