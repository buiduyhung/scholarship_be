import { Module } from '@nestjs/common';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CrawSchedule,
  CrawScheduleSchema,
} from 'src/crawler/schema/craw-schedule.schema';
import { CrawData, CrawDataSchema } from 'src/crawler/schema/craw-data.schema';

@Module({
  providers: [CrawlerService],
  controllers: [CrawlerController],
  imports: [
    MongooseModule.forFeature([
      { name: CrawSchedule.name, schema: CrawScheduleSchema },
      { name: CrawData.name, schema: CrawDataSchema },
    ]),
  ],
})
export class CrawlerModule {}
