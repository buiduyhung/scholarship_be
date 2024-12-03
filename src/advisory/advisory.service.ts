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
    private advisoryModel: SoftDeleteModel<AdvisoryDocument>, // Injecting the advisory model with soft delete capability
  ) { }

  async create(createUserAdvisoryDto: CreateUserAdvisoryDto) {
    const { emailAdvisory, fullName, phone, address, continent, time, value, level } = createUserAdvisoryDto;

    const newAd = await this.advisoryModel.create({
      emailAdvisory, fullName, phone, address, continent, time, value, level,
      status: "Đang Chờ Tư Vấn", // Default status for new advisory
      createdBy: emailAdvisory,
      history: [
        {
          status: "Đang Chờ Tư Vấn", // Initial history entry
          updatedAt: new Date, // Current timestamp
          updatedBy: {
            _id: null, // Placeholder for createdBy details
            email: null,
          }
        }
      ]
    });

    return {
      _id: newAd?._id, // Return the ID of the newly created advisory
      createdAt: newAd?.createdAt // Return creation timestamp
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs); // Parse query string to extract filters and options
    delete filter.current; // Remove unnecessary fields
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.advisoryModel.find(filter)).length; // Count total filtered items
    const totalPages = Math.ceil(totalItems / defaultLimit); // Calculate total pages

    const result = await this.advisoryModel.find(filter)
      .skip(offset) // Skip documents for pagination
      .limit(defaultLimit) // Limit the number of documents
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .populate(population) // Populate referenced fields
      .select(projection as any) // Select specific fields
      .exec();

    return {
      meta: {
        current: currentPage, // Current page
        pageSize: limit, // Number of records retrieved
        pages: totalPages, // Total pages
        total: totalItems // Total records matching the query
      },
      result // Retrieved documents
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found advisory"); // Validate ID format
    }
    return await this.advisoryModel.findById(id); // Find advisory by ID
  }

  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found advisory"); // Validate ID format
    }

    const updated = await this.advisoryModel.updateOne(
      { _id },
      {
        status, // Update advisory status
        updatedBy: {
          _id: user._id, // Track who updated the record
          email: user.email
        },
        $push: { // Add new entry to the history array
          history: {
            status: status,
            updatedAt: new Date, // Timestamp of the update
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        }
      });

    return updated; // Return update operation result
  }

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException("not found resume"); // Validate ID format

    await this.advisoryModel.updateOne(
      { _id },
      {
        deletedBy: { // Track who deleted the record
          _id: user._id,
          email: user.email
        },
      });
    return this.advisoryModel.softDelete({
      _id // Perform a soft delete on the record
    });
  }
}
