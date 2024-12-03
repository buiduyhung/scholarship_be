import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StudyService } from './study.service';
import { CreateStudyDto } from './dto/create-study.dto';
import { UpdateStudyDto } from './dto/update-study.dto';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@ApiTags('study')
@Controller('study')
export class StudyController {
  constructor(private readonly studyService: StudyService) {}

  @Post()
  @SkipCheckPermission()
  @ResponseMessage("create a new studyAboard")
  create(
    @Body() createStudyDto: CreateStudyDto,
    @User() user: IUser
  ) {
    return this.studyService.create(createStudyDto, user);
  }

  @Public()
  @Get('list-location')
  @ResponseMessage("Fetch all scholarship search")
  getListLocation() {
    return this.studyService.getListLocation();
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch List studyAboard with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string
  ) {
    return this.studyService.findAll(+currentPage, +limit, qs); // Modified: cast `currentPage` and `limit` to numbers.
  }

  @SkipCheckPermission()
  @Get(':id')
  @ResponseMessage("Fetch a studyAboard with id")
  findOne(@Param('id') id: string) {
    return this.studyService.findOne(id);
  }

  @Patch(':id')
  @SkipCheckPermission()
  @ResponseMessage("Update a studyAboard")
  update(
    @Param('id') id: string,
    @Body() updateStudyDto: UpdateStudyDto,
    @User() user: IUser
  ) {
    return this.studyService.update(id, updateStudyDto, user);
  }

  @Delete(':id')
  @SkipCheckPermission()
  @ResponseMessage("Delete a studyAboard")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.studyService.remove(id, user);
  }
}
