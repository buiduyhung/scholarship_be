import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public, ResponseMessage } from 'src/decorator/customize';
import { NewsService } from 'src/news/news.service';

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
  @Get('/:id')
  @ResponseMessage('Fetch a news with id')
  findOne(@Query('id') id: string) {
    return this.newsService.findOne(id);
  }
}
