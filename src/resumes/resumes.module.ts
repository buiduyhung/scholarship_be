import { Module } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { ResumesController } from './resumes.controller';
import { Resume, ResumeSchema } from './schemas/resume.schemas';
import { Provider, ProviderSchema } from 'src/provider/schemas/providers.schemas'; // Import Provider
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import PayOS from '@payos/node';
import { PayOSModule } from 'src/payos/payos.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Resume.name, schema: ResumeSchema },
      { name: Provider.name, schema: ProviderSchema },
      { name: User.name, schema: UserSchema } // Register Provider schema
    ]),
    CloudinaryModule,
    PayOSModule
  ],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule { }
