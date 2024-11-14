import { Module } from '@nestjs/common';
import { BlogService } from './blog.service';
import { BlogController } from './blog.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './schemas/blog.schemas';

@Module({
  imports: [
    // Registers the Blog schema with Mongoose for database interactions
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
    ])
  ],
  controllers: [BlogController],
  providers: [BlogService],
})
export class BlogModule { }

