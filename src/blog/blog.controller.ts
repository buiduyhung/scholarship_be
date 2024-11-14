import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) { }

  // Creates a new blog entry and associates it with the user who created it
  @Post()
  @SkipCheckPermission()
  @ResponseMessage("create a new blog")
  create(
    @Body() createBlogDto: CreateBlogDto,
    @User() user: IUser,
  ) {
    return this.blogService.create(createBlogDto, user);
  }

  // Retrieves a list of all blog entries
  @Get()
  findAll() {
    return this.blogService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this.blogService.update(+id, updateBlogDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(+id);
  }
}
