import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { UpdateInvitationDto } from './dto/update-invitation.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Invitation, InvitationDocument } from './schemas/invitation.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class InvitationService {
  constructor(
    @InjectModel(Invitation.name)
    private invitationModel: SoftDeleteModel<InvitationDocument>,
    private readonly mailerService: MailerService,
  ) { }

  async create(createInvitationDto: CreateInvitationDto, user: IUser) {
    const { emailReceiver, description } = createInvitationDto;
    const { email, _id } = user;

    const newInvite = await this.invitationModel.create({
      emailReceiver, email, description,
      status: "PENDING",
      createdBy: { _id, email },
      history: [
        {
          status: "PENDING",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })   // test case

    await this.mailerService.sendMail({
      to: emailReceiver,
      from: '"Support Team" <support@example.com>',
      subject: 'You have a new invitation',
      // html: '<p>Hello</p>',
      template: 'invitation',
      context: {
        description: description,
        senderEmail: email
      }
    });

    return {
      _id: newInvite?._id,
      createdAt: newInvite?.createdAt
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.invitationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.invitationModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
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
      throw new BadRequestException("not found invitation")
    }
    return await this.invitationModel.findById(id);
  }

  async update(_id: string, status: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found invitation")
    }

    const updated = await this.invitationModel.updateOne(
      { _id },
      {
        status,
        updatedBy: {
          _id: user._id,
          email: user.email
        },
        $push: {
          history: {
            status: status,
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

  async remove(_id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id))
      throw new BadRequestException("not found invitation")

    await this.invitationModel.updateOne(
      { _id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        },
      })
    return this.invitationModel.softDelete({
      _id
    });
  }

  async findByUsers(user: IUser) {
    return await this.invitationModel.find({
      userId: user._id,
    })
      .sort("-createdAt")
  }
}
