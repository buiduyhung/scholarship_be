import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PayOSService } from './payos.service';

// Định nghĩa module cho PayOS
@Module({
  imports: [ConfigModule], // Import ConfigModule để sử dụng cấu hình
  providers: [PayOSService], // Đăng ký PayOSService làm provider
  exports: [PayOSService], // Xuất PayOSService để các module khác sử dụng
})
export class PayOSModule { }
