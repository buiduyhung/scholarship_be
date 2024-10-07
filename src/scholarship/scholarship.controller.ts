import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('scholarship')
export class ScholarshipController {
  constructor(private readonly scholarshipService: ScholarshipService) { }

  @Post()
  @ResponseMessage("create a new scholarship")
  create(@Body() createScholarshipDto: CreateScholarshipDto, @User() user: IUser) {
    return this.scholarshipService.create(createScholarshipDto, user);
  }

  @Public()
  @Get('get-all')
  @ResponseMessage("Fetch all scholarship search")
  getAll() {
    return this.scholarshipService.getAll();
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch List Scholarship with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.scholarshipService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Public()
  @Get('search-list-scholarship')
  @ResponseMessage("get list scholarship of a provider")
  searchByProvider(@Query('id') id: string) {
    return this.scholarshipService.searchByProvider(id);
  }


  @Public()
  @Get(':id')
  @ResponseMessage("Fetch a Scholarship with id")
  findOne(@Param('id') id: string) {
    return this.scholarshipService.findOne(id);
  }


  @Patch(':id')
  @ResponseMessage("Update a Scholarship")
  update(
    @Param('id') id: string,
    @Body() updateScholarshipDto: UpdateScholarshipDto,
    @User() user: IUser

  ) {
    return this.scholarshipService.update(id, updateScholarshipDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a Scholarship")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.scholarshipService.remove(id, user);
  }
}
