import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { ChangePasswordDto, CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { IUser } from './users.interface';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

import { SkipCheckPermission } from 'src/decorator/customize';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

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

  @ResponseMessage('Get user information update')
  @SkipCheckPermission()
  @Get('/update')
  async handleGetAccount(@User() user: IUser) {
    if (!user) return null;
    const temp = (await this.usersService.findOne(user._id)) as any;
    return temp;
  }

  @Get('staff')
  @Public()
  @ResponseMessage("Fetch user names by hardcoded role ID")
  async findUserNamesByHardcodedRoleId() {
    const userNames = await this.usersService.findUserNamesByHardcodedRoleId();
    return userNames;
  }

  @Get()
  @ResponseMessage("Fetch List Users with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch user by id")
  async findOne(@Param('id') id: string) {
    const foundUser = await this.usersService.findOne(id);
    return foundUser
  }

  @ResponseMessage("Update a User")
  @SkipCheckPermission()
  @Patch()
  async update(@Body() updateUserDto: UpdateUserDto, @User() user: IUser) {
    let updatedUser = await this.usersService.update(updateUserDto, user);
    return updatedUser;
  }

  @ResponseMessage("Delete a User")
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }

  @Patch('change-password')
  @ResponseMessage('Change user password')
  @SkipCheckPermission() // Bỏ qua kiểm tra quyền cho endpoint này
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @User() user: IUser // Lấy thông tin user từ token
  ) {
    return this.usersService.changePassword(user._id, changePasswordDto); // Thực hiện đổi mật khẩu
  }

}
