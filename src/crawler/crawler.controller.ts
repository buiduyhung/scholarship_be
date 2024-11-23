import { Controller, Delete, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrawlerService } from 'src/crawler/crawler.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('crawler')
@ApiTags('crawler')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Get('/')
  @Public()
  @ApiOperation({
    summary: 'Crawl job listings from Indeed',
    description: 'Crawl job listings from Indeed',
  })
  async crawl() {
    return this.crawlerService.crawlIPD();
  }

  @Public()
  @Get('/scholarship')
  @ResponseMessage('Fetch List craw data with paginate')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.crawlerService.findAll(+currentPage, +limit, qs); // Modify this line
  }

  @Public()
  @Delete('/scholarship/:id')
  @ResponseMessage('Delete a craw data with id')
  delete(@Query('id') id: string, @User() user: IUser) {
    return this.crawlerService.remove(id, user);
  }
}
