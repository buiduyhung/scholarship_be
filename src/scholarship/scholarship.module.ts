import { Module } from '@nestjs/common';
import { ScholarshipService } from './scholarship.service';
import { ScholarshipController } from './scholarship.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Scholarship, ScholarshipSchema } from './schemas/scholarship.schemas';
import { Provider, ProviderSchema } from 'src/provider/schemas/providers.schemas';
import { User, UserSchema } from 'src/users/schemas/user.schema';


@Module({
  
  imports: [MongooseModule.forFeature([
    { name: Scholarship.name, schema: ScholarshipSchema }, // Đăng ký schema cho học bổng (Scholarship)
    { name: Provider.name, schema: ProviderSchema }, // Đăng ký schema cho nhà cung cấp (Provider)
    { name: User.name, schema: UserSchema } // Đăng ký schema cho người dùng (User)
  ])],
  
  // Đăng ký controller cho module, nơi xử lý các yêu cầu HTTP liên quan đến học bổng (Scholarship).
  controllers: [ScholarshipController],

  // Đăng ký provider cho module, chứa các logic nghiệp vụ liên quan đến học bổng.
  providers: [ScholarshipService]
})
export class ScholarshipModule { }