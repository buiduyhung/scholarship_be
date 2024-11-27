import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import {
  CrawSchedule,
  CrawScheduleDocument,
} from 'src/crawler/schema/craw-schedule.schema';
import {
  Permission,
  PermissionDocument,
} from 'src/permissions/schemas/permission.schemas';
import { Role, RoleDocument } from 'src/roles/schemas/role.schemas';
import { User, UserDocument } from 'src/users/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import {
  ADMIN_ROLE,
  CHAT_PERMISSIONS,
  CRAW_DATA,
  INIT_PERMISSIONS,
  USER_ROLE,
} from './sample';

@Injectable()
export class DatabasesService implements OnModuleInit {
  private readonly logger = new Logger(DatabasesService.name);

  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,

    @InjectModel(Permission.name)
    private permissionModel: SoftDeleteModel<PermissionDocument>,

    @InjectModel(Role.name)
    private roleModel: SoftDeleteModel<RoleDocument>,

    @InjectModel(CrawSchedule.name)
    private crawScheduleModel: SoftDeleteModel<CrawScheduleDocument>,

    private configService: ConfigService,
    private userService: UsersService,
  ) { }

  async onModuleInit() {
    const isInit = this.configService.get<string>('SHOULD_INIT');
    if (Boolean(isInit)) {
      this.logger.log('>>> INIT SAMPLE DATA...');
      const countUser = await this.userModel.count({});
      const countPermission = await this.permissionModel.count({});
      const countRole = await this.roleModel.count({});
      const countCrawSchedule = await this.crawScheduleModel.count({});

      // create permission
      if (countPermission === 0) {
        this.logger.log('>>> INIT PERMISSIONS...');
        await this.permissionModel.insertMany([
          ...INIT_PERMISSIONS,
          ...CHAT_PERMISSIONS,
        ]);
      }

      if (countRole === 0) {
        this.logger.log('>>> INIT ROLES...');
        const permissions = await this.permissionModel.find({}).select('_id');
        const chatPermissions = await this.permissionModel
          .find({ name: { $in: CHAT_PERMISSIONS.map((p) => p.name) } })
          .select('_id');
        await this.roleModel.insertMany([
          {
            name: ADMIN_ROLE,
            description: 'Admin full quyền',
            isActive: true,
            permissions: permissions,
          },
          {
            name: USER_ROLE,
            description: 'Người dùng/Ứng viên sử dụng hệ thống',
            isActive: true,
            permissions: chatPermissions, // không set quyền, chỉ cần add ROLE
          },
        ]);
      }

      if (countCrawSchedule === 0) {
        this.logger.log('>>> INIT CRAW SCHEDULE...');
        await this.crawScheduleModel.insertMany(CRAW_DATA);
      }

      if (countUser === 0) {
        this.logger.log('>>> INIT USERS...');
        const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
        const userRole = await this.roleModel.findOne({ name: USER_ROLE });
        await this.userModel.insertMany([
          {
            name: "I'm Admin",
            email: 'admin@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 30,
            gender: 'MALE',
            address: 'VietNam',
            phone: '0366854448',
            role: adminRole?._id,
          },
          {
            name: "I'm conganh",
            email: 'conganh@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 22,
            gender: 'MALE',
            address: 'VietNam',
            phone: '0366854448',
            role: adminRole?._id,
          },
          {
            name: "I'm normal user",
            email: 'user@gmail.com',
            password: this.userService.getHashPassword(
              this.configService.get<string>('INIT_PASSWORD'),
            ),
            age: 45,
            gender: 'MALE',
            address: 'VietNam',
            phone: '0324853238',
            role: userRole?._id,
          },
        ]);
      }


      if (countUser > 0 && countRole > 0 && countPermission > 0) {
        this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
      }
    }
  }
}
