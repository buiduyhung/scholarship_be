import { Injectable } from '@nestjs/common';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from './schemas/blog.schemas';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';

@Injectable()

export class BlogService {
  constructor(
    @InjectModel(Blog.name)
    private blogModel: SoftDeleteModel<BlogDocument>,
  ) { }

  async create(createBlogDto: CreateBlogDto, user: IUser) {
    const { name, image, description } = createBlogDto;
    const { email, _id } = user

    let newBlog = await this.blogModel.create({
      name, image, description, email,
      userId: _id,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newBlog?._id,
      createdAt: newBlog?.createdAt
    }
  }


  findAll() {
    return `This action returns all blog`;
  }

  findOne(id: number) {
    return `This action returns a #${id} blog`;
  }

  update(id: number, updateBlogDto: UpdateBlogDto) {
    return `This action updates a #${id} blog`;
  }

  remove(id: number) {
    return `This action removes a #${id} blog`;
  }
}
