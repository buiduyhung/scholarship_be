import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  providers: [CrawlerService],
  controllers: [CrawlerController],
})
export class CrawlerModule {}
