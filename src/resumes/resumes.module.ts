import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PayOSModule } from 'src/payos/payos.module';
import {
  Provider,
  ProviderSchema,
} from 'src/provider/schemas/providers.schemas'; // Import Provider
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { ResumesController } from './resumes.controller';
import { ResumesService } from './resumes.service';
import { Resume, ResumeSchema } from './schemas/resume.schemas';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: Provider.name, schema: ProviderSchema },
      { name: User.name, schema: UserSchema }, // Register Provider schema
    ]),
    PayOSModule,
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
