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
      name, fundingMethod, provider, location, level, value, quantity, subject,
      description, requirement, register, type, startDate, endDate, isActive
    } = createScholarshipDto;

    let newScholarship = await this.scholarshipModel.create({
      name, fundingMethod, provider, location, level, value, quantity, subject,
      description, requirement, register, type, startDate, endDate, isActive,
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

  async findAll(currentPage: number, limit: number, qs: string, userId?: string) {
    // Step 1: Check if userId is provided
    if (userId) {
      console.log("User ID provided:", userId); // Log the userId

      // Get user information from userModel and select the provider field
      const user = await this.userModel.findById(userId).select('provider');
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      console.log("User found:", user); // Log the user object

      // Get provider ID from user.provider
      const providerId = user.provider ? user.provider.toString() : null;
      if (!providerId) {
        throw new BadRequestException(`Provider not found for user with ID ${userId}`);
      }

      // Remove `userId` from `qs` if it exists
      const queryParams = new URLSearchParams(qs);
      queryParams.delete('userId');

      // Add providerId to filter to only get scholarships related to the user's provider
      queryParams.append('provider', providerId);
      qs = queryParams.toString();
    }

    // Check the content of the query string after adding provider ID
    console.log("Query String:", qs);

    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    console.log("Filter:", filter); // Log to check filter

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    // Count total number of records matching the filter
    const totalItems = await this.scholarshipModel.countDocuments(filter);
    console.log("Total Items:", totalItems); // Log the number of records found
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Get the list of scholarships based on the filter and pagination
    const result = await this.scholarshipModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    console.log("Result:", result); // Log the result to check

    return {
      meta: {
        current: currentPage, // current page
        pageSize: limit, // number of records fetched
        pages: totalPages, // total number of pages with the query condition
        total: totalItems // total number of elements (records)
      },
      result // query result
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return `not found scholarship`;
    }
    return (await this.scholarshipModel.findById(id))
      .populate({
        path: "provider", select: { _id: 1, name: 1, logo: 1 } //-1 is off
      });
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

  async searchByProvider(id: string) {
    // Ensure the id is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Invalid provider ID");
    }

    // Find the provider by its _id field
    const provider = await this.providerModel.findById(id);

    // Check if provider exists
    if (!provider) {
      throw new BadRequestException("Provider not found");
    }

    // Find all scholarships associated with the provider
    const scholarships = await this.scholarshipModel.find({
      provider: provider._id
    }).exec();

    return scholarships;
  }
}
