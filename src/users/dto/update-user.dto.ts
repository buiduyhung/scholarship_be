import { OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsNotEmpty } from 'class-validator';

// DTO để cập nhật thông tin người dùng
export class UpdateUserDto extends OmitType(CreateUserDto, ['password', 'email'] as const) {
    @IsNotEmpty()
    _id: string;
}
