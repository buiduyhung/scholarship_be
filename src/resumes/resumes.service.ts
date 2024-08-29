import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import mongoose from 'mongoose';
import aqp from 'api-query-params';
import { Resume, ResumeDocument } from './schemas/resume.schemas';
import { Provider } from 'src/provider/schemas/providers.schemas';
import { User } from 'src/users/schemas/user.schema'; // Add this import
import { Types } from 'mongoose'; // Add this import

@Injectable()
export class ResumesService {

  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
    @InjectModel(Provider.name)
    private providerModel: mongoose.Model<Provider>,
    @InjectModel(User.name) // Add this line
    private userModel: mongoose.Model<User> // Add this line
  ) { }

  async searchByProviderName(providerName: string) {
    // Step 1: Query the provider by name
    const provider = await this.providerModel.findOne({ name: new RegExp(`^${providerName}$`, 'i') });


    // Check if provider is found
    if (!provider) {
      throw new BadRequestException("Provider not found");
    }

    // Step 2: Query resumes based on the provider's ID
    const resumes = await this.resumeModel.find({
      provider: provider._id
    }).exec();

    return resumes;
  }

  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    const { urlCV, urlLetter, provider, scholarship } = createUserCvDto;
    const { email, _id } = user;

    const newCV = await this.resumeModel.create({
      urlCV, urlLetter, email, provider, scholarship,
      userId: _id,
      status: "PENDING",
      invitation: "",
      createdBy: { _id, email },
      history: [
        {
          status: "PENDING",
          invitation: "",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })

    return {
      _id: newCV?._id,
      createdAt: newCV?.createdAt
    }
  }


  async findAll(currentPage: number, limit: number, qs: string, userId?: string) {
    // Step 1: Check if userId is provided
    if (userId) {
      // Get user information from userModel and select the provider field
      const user = await this.userModel.findById(userId).select('provider');
      if (!user) {
        throw new BadRequestException(`User with ID ${userId} not found`);
      }

      // Get provider ID from user.provider
      const providerId = user.provider ? user.provider.toString() : null;
      if (!providerId) {
        throw new BadRequestException(`Provider not found for user with ID ${userId}`);
      }

      // Remove `userId` from `qs` if it exists
      const queryParams = new URLSearchParams(qs);
      queryParams.delete('userId');

      // Add providerId to filter to only get resumes related to the user's provider
      queryParams.append('provider', providerId);
      qs = queryParams.toString();
    }

    // Check the content of the query string after adding provider ID
    console.log("Query String:", qs);

    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    // Convert provider filter to ObjectId
    if (filter.provider) {
      filter.provider = new Types.ObjectId(filter.provider);
    }

    console.log("Filter:", filter); // Log to check filter

    const offset = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    // Count total number of records matching the filter
    const totalItems = await this.resumeModel.countDocuments(filter);
    console.log("Total Items:", totalItems); // Log the number of records found
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Get the list of resumes based on the filter and pagination
    const result = await this.resumeModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
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
      throw new BadRequestException("not found resume")
    }
    return await this.resumeModel.findById(id);
  }


  async update(_id: string, status: string, invitation: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found resume")
    }

    const updated = await this.resumeModel.updateOne(
      { _id },
      {
        status,
        invitation,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
            invitation: invitation,
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

  async findByUsers(user: IUser) {
    return await this.resumeModel.find({
      userId: user._id,
    })
      .sort("-createdAt")
      .populate([
        {
          path: "provider",
          select: { name: 1 }
        },
        {
          path: "scholarship",
          select: { name: 1 }
        }
      ])
  }


  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException("not found resume")

    await this.resumeModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
      })
    return this.resumeModel.softDelete({
      _id
    });
  }
}


