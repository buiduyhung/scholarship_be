import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { News, NewSchema } from 'src/news/schema/news.schema';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';

@Module({
  providers: [NewsService],
  controllers: [NewsController],
  imports: [
    MongooseModule.forFeature([{ name: News.name, schema: NewSchema }]),
  ],
})
export class NewsModule {}
