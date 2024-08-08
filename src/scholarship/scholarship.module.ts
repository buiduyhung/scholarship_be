import { Module } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { ScholarshipController } from './scholarship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Scholarship, ScholarshipSchema } from './schemas/scholarship.schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: Scholarship.name, schema: ScholarshipSchema }])],
  controllers: [ScholarshipController],
  providers: [ScholarshipService]
})
export class ScholarshipModule { }
