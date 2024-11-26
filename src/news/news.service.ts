import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { News, NewsDocument } from 'src/news/schema/news.schema';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class NewsService {
  private readonly logger: Logger;
  constructor(
    @InjectModel(News.name)
    private newsModel: SoftDeleteModel<NewsDocument>,
  ) {
    this.logger = new Logger(NewsService.name);
  }
  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    // Query tổng số bản ghi
    const totalItems = await this.newsModel.countDocuments(filter);

    // Tính tổng số trang
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Thực hiện query học bổng
    const result = await this.newsModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage, // Trang hiện tại
        pageSize: limit, // Số bản ghi mỗi trang
        pages: totalPages, // Tổng số trang
        total: totalItems, // Tổng số bản ghi
      },
      result, // Kết quả trả về
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found news`;
    }
    return await this.newsModel.findById(id);
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) return `not found news data`;
    await this.newsModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );
    return this.newsModel.softDelete({
      _id: id,
    });
  }
}
