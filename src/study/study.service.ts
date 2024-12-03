import { Injectable } from '@nestjs/common';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { Study, StudyDocument } from './schemas/study.schemas';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import mongoose from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';



@Injectable()
export class StudyService {
  constructor(
    @InjectModel(Study.name)
    private studyModel: SoftDeleteModel<StudyDocument>,
    @InjectModel(User.name)   // Injecting the User model
    private userModel: mongoose.Model<User> // Injecting the User model for operations involving user data
  ) { }

  async create(createStudyDto: CreateStudyDto, user: IUser) {
    const {
      name, continent, location, image,
      description, isActive
    } = createStudyDto;

    let newStudy = await this.studyModel.create({
      name, continent, location, image,
      description, isActive,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newStudy?._id,
      createdAt: newStudy?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.studyModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.studyModel.find(filter)
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
      return `not found studyAboard`;
    }
    return await this.studyModel.findById(id)
  }


  async update(id: string, updateStudyDto: UpdateStudyDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found studyAboard`;
    const updated = await this.studyModel.updateOne(
      { _id: id },
      {
        ...updateStudyDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return updated;
  }

  async getListLocation(): Promise<Record<string, string[]>> {
    // Truy vấn tất cả các học bổng và chỉ lấy các trường continent và location
    const study = await this.studyModel.find().select('continent location -_id').exec();

    // Sử dụng reduce để nhóm location theo continent và loại bỏ các location trùng lặp
    const continentLocations = study.reduce((acc, study) => {
      const continent = study.continent;
      const location = study.location;

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

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found studyAboard`;
    await this.studyModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      })
    return this.studyModel.softDelete({
      _id: id
    })
  }
}
