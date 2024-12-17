import { MailerService } from '@nestjs-modules/mailer';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose, { PipelineStage, Types } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Provider } from 'src/provider/schemas/providers.schemas';
import { User } from 'src/users/schemas/user.schema'; // Add this import
import { IUser } from 'src/users/users.interface';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { Resume, ResumeDocument } from './schemas/resume.schemas';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(Provider.name)
    private providerModel: mongoose.Model<Provider>,
    @InjectModel(User.name) // Add this line
    private userModel: mongoose.Model<User>, // Add this line
    private readonly mailerService: MailerService,
  ) { }

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { urlCV, scholarship, staff } = createUserCvDto;
    const { name, email, _id } = user;

    const newCV = await this.resumeModel.create({
      urlCV,
      email,
      name,
      staff,
      note: '',
      scholarship,
      userId: _id,
      status: 'Đang chờ thanh toán',
      orderCode: this.generateOrderCode(),
      createdBy: { _id, email },
      history: [
        {
          status: 'Đang chờ thanh toán',
          note: '',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            email: user.email,
          },
        },
      ],
    });

    return {
      _id: newCV?._id,
      createdAt: newCV?.createdAt,
      orderCode: newCV?.orderCode,
    };
  }

  generateOrderCode(): number {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return parseInt(`${year}${month}${day}${hour}${minute}${second}`);
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const pipelines: PipelineStage[] = [
      {
        $lookup: {
          from: 'scholarships',
          localField: 'scholarship',
          foreignField: '_id',
          as: 'scholarship',
        },
      },
      {
        $unwind: {
          path: '$scholarship',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: { // Add this lookup stage
          from: 'users',
          localField: 'staff',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: { // Unwind the user array
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          urlCV: 1,
          status: 1,
          name: 1,
          orderCode: 1,
          createdAt: 1,
          createdBy: 1,
          updatedBy: 1,
          deletedBy: 1,
          isDeleted: 1,
          history: 1,
          userID: 1,
          email: 1,
          'scholarship.name': 1,
          'scholarship._id': 1,
          'user.name': 1, // Project user name
          'user._id': 1,  // Project user ID
          ...projection,
        },
      },
    ];
    if (filter) {
      const matchStage: any = { ...filter };
      if (filter['scholarship._id']) {
        matchStage['scholarship._id'] = new mongoose.Types.ObjectId(
          filter['scholarship._id'] as string,
        );
      }
      pipelines.push({ $match: matchStage });
    }
    pipelines.push(
      { $skip: offset },
      { $limit: defaultLimit },
      { $sort: { createdAt: -1 } },
    );

    const countPipelines: PipelineStage[] = [
      ...pipelines,
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $count: 'total',
      },
    ];

    const count = await this.resumeModel.aggregate(countPipelines);
    const totalItems = count.length > 0 ? count[0].total : 0;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .aggregate(pipelines)
      .allowDiskUse(true)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException('not found resume');
    }
    return (await this.resumeModel.findById(id)).populate([
      {
        path: 'scholarship',
        select: { name: 1 },
      },
    ]);
  }

  async findOneByOrderCode(orderCode: number) {
    return this.resumeModel.findOne({ orderCode }).populate([
      {
        path: 'scholarship',
        select: { name: 1 },
      },
    ]);
  }

  async update(
    _id: string,
    status: string,
    urlCV: string,
    note: string,
    user: IUser,
    orderCode?: number,
  ) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException('not found resume');
    }

    const updated = await this.resumeModel.updateOne(
      { _id },
      {
        status,
        urlCV,
        note,
        orderCode,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
        $push: {
          history: {
            status: status,
            urlCV: urlCV,
            note: note,
            updatedAt: new Date(),
            updatedBy: {
              _id: user._id,
              email: user.email,
            },
          },
        },
      },
    );

    return updated;
  }

  async findByUsers(user: IUser) {
    return await this.resumeModel
      .find({
        userId: user._id,
      })
      .sort('-createdAt')
      .populate([
        {
          path: 'scholarship',
          select: { name: 1 },
        },
      ]);
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException('not found resume');

    await this.resumeModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.resumeModel.softDelete({
      _id,
    });
  }

  async updateStaff(id: string, staff: mongoose.Types.ObjectId, user: IUser) { // Use Types.ObjectId
    const updated = await this.resumeModel.updateOne(
      { _id: id },
      {
        staff,
      },
    );
    return updated;
  }

  async updateStatusByOrderCode(
    orderCode: number,
    status: string,
    user?: IUser,
  ) {
    const currentResume = await this.resumeModel.findOne({ orderCode }).exec();
    if (!currentResume) {
      throw new BadRequestException('Resume not found');
    }
    if (currentResume.status === status) {
      throw new BadRequestException('Status is the same');
    }

    return await this.resumeModel.updateOne(
      { orderCode },
      {
        $set: { status: status },
        $push: {
          history: {
            status: status,
            updatedAt: new Date(),
            updatedBy: currentResume.createdBy,
          },
        },
      },
    );
  }

  async updateOrderCode(_id: string, orderCode: number) {
    return await this.resumeModel.updateOne({ _id }, { orderCode });
  }
}
