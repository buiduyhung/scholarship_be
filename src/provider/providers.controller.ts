import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProviderService } from './providers.service';
import { CreateProviderDto } from './dto/create-providers.dto';
import { UpdateProviderDto } from './dto/update-providers.dto';
import { ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProviderService) { }

  @Post()
  create(@Body() createProviderDto: CreateProviderDto, @User() user: IUser) {
    return this.providersService.create(createProviderDto, user);
  }

  @Get()
  @ResponseMessage("Fetch List Company with paginate")
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qs: string,
  ) {
    return this.providersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.providersService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @User() user: IUser

  ) {
    return this.providersService.update(id, updateProviderDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.providersService.remove(id, user);
  }
}
