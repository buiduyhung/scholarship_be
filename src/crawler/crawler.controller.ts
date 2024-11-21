import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CrawlerService } from 'src/crawler/crawler.service';
import { Public } from 'src/decorator/customize';

@Controller('crawler')
@ApiTags('crawler')
export class CrawlerController {
  private readonly logger: Logger;
  constructor(private readonly crawlerService: CrawlerService) {
    this.logger = new Logger(CrawlerController.name);
  }

  @Get('/')
  @Public()
  @ApiOperation({
    summary: 'Crawl job listings from Indeed',
    description: 'Crawl job listings from Indeed',
  })
  async crawl() {
    return this.crawlerService.crawlIPD();
  }
}
