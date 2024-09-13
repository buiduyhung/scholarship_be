import { Injectable } from '@nestjs/common';
import { CreateProviderFileDto, CreateRegisterDto } from './dto/create-register.dto';
import { UpdateRegisterDto } from './dto/update-register.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Register, RegisterDocument } from './schemas/register.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class RegisterService {
  constructor(
    @InjectModel(Register.name)
    private registerModel: SoftDeleteModel<RegisterDocument>
  ) { }

  async create(createProviderFileDto: CreateProviderFileDto, user: IUser) {
    const { url } = createProviderFileDto;
    const { email, _id } = user;

    const newFile = await this.registerModel.create({
      url,
      userId: _id,
      status: "PENDING",
      message: "",
      createdBy: { _id, email },
      history: [
        {
          status: "PENDING",
          message: "",
          updatedAt: new Date,
          updatedBy: {
            _id: user._id,
            email: user.email
          }
        }
      ]
    })

    return {
      _id: newFile?._id,
      createdAt: newFile?.createdAt
    }
  }


  findAll() {
    return `This action returns all register`;
  }

  findOne(id: number) {
    return `This action returns a #${id} register`;
  }

  update(id: number, updateRegisterDto: UpdateRegisterDto) {
    return `This action updates a #${id} register`;
  }

  remove(id: number) {
    return `This action removes a #${id} register`;
  }
}
