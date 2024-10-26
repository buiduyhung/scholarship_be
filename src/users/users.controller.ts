// Import các module và dịch vụ cần thiết
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

// Đánh dấu các endpoint của controller liên quan đến user
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  // Endpoint để tạo người dùng mới
  @Post()
  @ResponseMessage("Create a new user")
  async create(
    @Body() createUserDto: CreateUserDto, @User() user: IUser) {
    let newUser = await this.usersService.create(createUserDto, user);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }

  // Endpoint để lấy danh sách người dùng
  @Get()
  @ResponseMessage("Fetch List Users with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  // Endpoint để lấy thông tin người dùng theo ID
  @Public()
  @Get(':id')
  @ResponseMessage("Fetch user by id")
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser;
  }

  // Endpoint để cập nhật thông tin người dùng
  @ResponseMessage("Update a User")
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    let updatedUser = await this.usersService.update(updateUserDto, user);
    return updatedUser;
  }

  // Endpoint để xoá người dùng
  @ResponseMessage("Delete a User")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  // Endpoint để thay đổi mật khẩu của người dùng
  @Patch('change-password')
  @ResponseMessage('Change user password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: IUser
  ) {
    return this.usersService.changePassword(user._id, changePasswordDto);
  }
}
