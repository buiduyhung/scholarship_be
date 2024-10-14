import { Module } from '@nestjs/common';
import { AdvisoryService } from './advisory.service';
import { AdvisoryController } from './advisory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Advisory, AdvisorySchema } from './schemas/advisory.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Advisory.name, schema: AdvisorySchema },
      { name: User.name, schema: UserSchema } // Register Provider schema
    ])
  ],
  controllers: [AdvisoryController],
  providers: [AdvisoryService]
})
export class AdvisoryModule { }
