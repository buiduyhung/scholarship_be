import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume, ResumeSchema } from './schemas/resume.schemas';
import { Provider, ProviderSchema } from 'src/provider/schemas/providers.schemas'; // Import Provider
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: Provider.name, schema: ProviderSchema } // Register Provider schema
    ])
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule { }
