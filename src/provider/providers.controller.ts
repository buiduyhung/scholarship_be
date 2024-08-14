import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProviderService } from './providers.service';
import { CreateProviderDto } from './dto/create-providers.dto';
import { UpdateProviderDto } from './dto/update-providers.dto';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProviderService) { }

  @Post()
  @ResponseMessage("Create a new provider")
  create(@Body() createProviderDto: CreateProviderDto, @User() user: IUser) {
    return this.providersService.create(createProviderDto, user);
  }

  @Public()
  @Get()
  @ResponseMessage("Fetch List Provider with paginate")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,
  ) {
    return this.providersService.findAll(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  @ResponseMessage("Fetch Provider by id")
  async findOne(@Param('id') id: string) {
    const foundProvider = await this.providersService.findOne(id);
    return foundProvider
  }

  @Patch(':id')
  @ResponseMessage("Update a provider")
  update(
    @Param('id') id: string,
    @Body() updateProviderDto: UpdateProviderDto,
    @User() user: IUser

  ) {
    return this.providersService.update(id, updateProviderDto, user);
  }

  @Delete(':id')
  @ResponseMessage("Delete a provider")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.providersService.remove(id, user);
  }
}
