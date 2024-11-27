import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CrawSchedule,
  CrawScheduleSchema,
} from 'src/crawler/schema/craw-schedule.schema';
import { PayOSModule } from 'src/payos/payos.module';
import {
  Permission,
  PermissionSchema,
} from 'src/permissions/schemas/permission.schemas';
import { Role, RoleSchema } from 'src/roles/schemas/role.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { DatabasesController } from './databases.controller';
import { DatabasesService } from './databases.service';

@Module({
  controllers: [DatabasesController],
  providers: [DatabasesService, UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: CrawSchedule.name, schema: CrawScheduleSchema },
    ]),
    PayOSModule,
  ],
})
export class DatabasesModule { }
