import { Module } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { ScholarshipController } from './scholarship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Scholarship, ScholarshipSchema } from './schemas/scholarship.schemas';
import { Provider, ProviderSchema } from 'src/provider/schemas/providers.schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: Scholarship.name, schema: ScholarshipSchema },
  { name: Provider.name, schema: ProviderSchema }
  ])],
  controllers: [ScholarshipController],
  providers: [ScholarshipService]
})
export class ScholarshipModule { }
