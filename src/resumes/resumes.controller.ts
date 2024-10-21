import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) { }

  @Post()
  @ResponseMessage("Create a new resume")
  create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @Get()
  @ResponseMessage("Fetch all resumes with pagination")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,

  ) {
    return this.resumesService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  // @Get('search-by-provider')
  // @ResponseMessage("Search resumes by provider name")
  // searchByProviderName(@Query('providerName') providerName: string) {
  //   return this.resumesService.searchByProviderName(providerName);
  // }

  @Post('by-user')
  @ResponseMessage("Get Resumes by User")
  getResumesByUser(@User() user: IUser) {
    return this.resumesService.findByUsers(user);
  }

  @Get(':id')
  @ResponseMessage("Fetch a resume by id")
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage("Update status resume")
  updateStatus(@Param('id') id: string, @Body("status") status: string, @User() user: IUser) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a resume")
  remove(
    @Param('id') id: string,
    @User() user: IUser
  ) {
    return this.resumesService.remove(id, user);
  }
}
