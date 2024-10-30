import { Module } from '@nestjs/common';
import { StudyService } from './study.service';
import { StudyController } from './study.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Study, StudySchema } from './schemas/study.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Study.name, schema: StudySchema },
  { name: User.name, schema: UserSchema }
  ])],
  controllers: [StudyController],
  providers: [StudyService],
})
export class StudyModule { }
