import { BadRequestException, Injectable } from '@nestjs/common';
import { ChangePasswordDto, CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User as UserM, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { User } from 'src/decorator/customize';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { USER_ROLE } from 'src/databases/sample';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {

  constructor(
    @InjectModel(UserM.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    private readonly mailerService: MailerService

  ) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash;
  }

  async create(createUserDto: CreateUserDto, @User() user: IUser) {
    const {
      name, email, password, age, gender, phone, address, role, provider, avatar
    } = createUserDto;

    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} already exists. Please use a different email. `)
    }

    const hashPassword = this.getHashPassword(password);

    let newUser = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      avatar,
      phone,
      address,
      role,
      provider,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    });
    return newUser;
  }


  async register(user: RegisterUserDto) {
    const { name, email, password, age, gender, address } = user;
    //add logic check email
    const isExist = await this.userModel.findOne({ email });
    if (isExist) {
      throw new BadRequestException(`Email: ${email} already exists. Please use a different email. `)
    }

    const userRole = await this.roleModel.findOne({ name: USER_ROLE });

    const hashPassword = this.getHashPassword(password);
    const codeId = uuidv4();
    let newRegister = await this.userModel.create({
      name,
      email,
      password: hashPassword,
      age,
      gender,
      address,
      role: userRole?._id,
      isActive: false,
      codeId: codeId,
      codeExpired: dayjs().add(5, 'minutes')
    })

    this.mailerService.sendMail({
      to: newRegister.email, // list of receivers
      subject: 'Activate your account', // Subject line
      template: 'register',
      html: `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 20px;
            }
            .email-container {
                background-color: #ffffff;
                padding: 20px;
                margin: 0 auto;
                border-radius: 8px;
                max-width: 600px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
                color: #333333;
            }
            h1 {
                color: #2c3e50;
                text-align: center;
                font-size: 24px;
            }
            p {
                font-size: 16px;
                color: #555555;
                line-height: 1.6;
            }
            .code {
                font-size: 20px;
                color: #2c3e50;
                font-weight: bold;
                text-align: center;
                padding: 10px 0;
                margin: 20px 0;
                background-color: #f9f9f9;
                border: 1px solid #dddddd;
                border-radius: 5px;
            }
            .footer {
                margin-top: 20px;
                text-align: center;
                font-size: 12px;
                color: #aaaaaa;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <h1>Activate Your Account</h1>
            <p>Hello ${newRegister?.name ?? newRegister.email},</p>
            <p>Thank you for registering with us. To activate your account, please use the activation code below:</p>
            <div class="code">${codeId}</div>
            <p>Please enter this code on the activation page within the next 5 minutes.</p>
            <p>If you did not sign up for this account, please ignore this email.</p>
            <p>Best regards,<br/>The Support Team</p>
        </div>
        <div class="footer">
            <p>This is an automated message, please do not reply.</p>
        </div>
    </body>
    </html>
  `,
      // context: {
      //   name: newRegister?.name ?? newRegister.email,
      //   activationCode: codeId
      // }
    })
    return newRegister;
  }


  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, projection, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .select('-password')
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
      return `not found user`;
    return await this.userModel.findOne({
      _id: id
    }).select("-password")
      .populate({ path: 'role', select: { name: 1 } })
  }

  findOneByUsername(username: string) {

    return this.userModel.findOne({
      email: username
    }).populate({ path: 'role', select: { name: 1 } })
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }


  async update(updateUserDto: UpdateUserDto, user: IUser) {
    const updated = await this.userModel.updateOne(
      { _id: updateUserDto._id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      });
    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id))
      return `not found user`;

    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException('Cannot delete admin user');
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      });

    return this.userModel.softDelete({
      _id: id
    });
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne(
      { _id },
      { refreshToken }
    );
  }

  findUserByToken = async (refreshToken: string) => {
    return await this.userModel.findOne(
      { refreshToken }
    ).populate({ path: 'role', select: { name: 1 } })
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
    const { currentPassword, newPassword } = changePasswordDto;

    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const isPasswordValid = this.isValidPassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect.');
    }

    user.password = this.getHashPassword(newPassword);
    await user.save();

    return { message: 'Password updated successfully' };
  }

}
