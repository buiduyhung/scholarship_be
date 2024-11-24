import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { NewsService } from 'src/news/news.service';
import { IUser } from 'src/users/users.interface';

@Controller('news')
@ApiTags('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Public()
  @Get('/')
  @ResponseMessage('Fetch List news with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.newsService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Public()
  @Delete('/:id')
  @ResponseMessage('Delete a news with id')
  delete(@Query('id') id: string, @User() user: IUser) {
    return this.newsService.remove(id, user);
  }
}
