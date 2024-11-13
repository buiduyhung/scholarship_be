import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { AdvisoryService } from './advisory.service';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { CreateUserAdvisoryDto } from './dto/create-advisory.dto';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('advisory')
@Controller('advisory')
export class AdvisoryController {
  constructor(private readonly advisoryService: AdvisoryService) { }

  @Post()
  @Public()
  @ResponseMessage("Create a new Advisory")
  create(@Body() createUserAdvisoryDto: CreateUserAdvisoryDto) {
    return this.advisoryService.create(createUserAdvisoryDto);
  }

  @Get()
  @SkipCheckPermission()
  @ResponseMessage("Fetch all Advisory with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,

  ) {
    return this.advisoryService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Get(':id')
  @SkipCheckPermission()
  @ResponseMessage("Fetch a Advisory by id")
  findOne(@Param('id') id: string) {
    return this.advisoryService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage("Update status advisory")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.advisoryService.update(id, status, user);
  }

  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage("Delete a Advisory")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.advisoryService.remove(id, user);
  }
}
