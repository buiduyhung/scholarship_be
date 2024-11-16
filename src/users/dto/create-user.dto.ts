import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsEmail,
    IsMongoId,
    IsNotEmpty,
    IsNotEmptyObject,
    IsNumber,
    IsObject,
    IsOptional,
    IsPhoneNumber,
    IsString,
    Max,
    Min,
    ValidateNested
} from 'class-validator';
import mongoose from 'mongoose';

// Đây là một class không sử dụng, được comment lại.
// class Provider { // Định nghĩa cấu trúc object Provider và xác thực dữ liệu
//     @IsNotEmpty() // Kiểm tra không được để trống
//     _id: mongoose.Schema.Types.ObjectId; // Loại dữ liệu là ObjectId của MongoDB

//     @IsNotEmpty() // Kiểm tra không được để trống
//     name: string; // Tên của provider
// }

// DTO để tạo người dùng (admin)
export class CreateUserDto {
    @IsNotEmpty() // Trường này không được để trống
    name: string; // Tên người dùng

    @IsEmail() // Xác minh email hợp lệ
    @IsNotEmpty() // Trường này không được để trống
    email: string; // Email người dùng

    @IsNotEmpty() // Trường này không được để trống
    password: string; // Mật khẩu

    @IsNotEmpty() // Trường này không được để trống
    avatar: string; // Đường dẫn avatar

    @IsNotEmpty() // Trường này không được để trống
    age: number; // Tuổi của người dùng

    @IsNotEmpty() // Trường này không được để trống
    address: string; // Địa chỉ

    @IsPhoneNumber('VN') // Số điện thoại phải thuộc mã vùng Việt Nam
    @IsNotEmpty() // Trường này không được để trống
    phone: string; // Số điện thoại của người dùng

    @IsNotEmpty() // Trường này không được để trống
    gender: string; // Giới tính của người dùng

    @IsNotEmpty() // Trường này không được để trống
    isActive: boolean; // Trạng thái hoạt động (true/false)

    @IsMongoId() // Xác minh đây là ObjectId hợp lệ của MongoDB
    @IsNotEmpty() // Trường này không được để trống
    role: mongoose.Schema.Types.ObjectId; // Vai trò của người dùng
}

// DTO để đăng ký người dùng
export class RegisterUserDto {
    @IsNotEmpty() // Trường này không được để trống
    name: string; // Tên người dùng

    @IsEmail() // Xác minh email hợp lệ
    @IsNotEmpty() // Trường này không được để trống
    email: string; // Email người dùng

    @IsNotEmpty() // Trường này không được để trống
    password: string; // Mật khẩu

    @IsNotEmpty() // Trường này không được để trống
    age: number; // Tuổi của người dùng

    @IsPhoneNumber('VN') // Số điện thoại phải thuộc mã vùng Việt Nam
    @IsNotEmpty() // Trường này không được để trống
    phone: number; // Số điện thoại

    @IsNotEmpty() // Trường này không được để trống
    address: string; // Địa chỉ

    @IsNotEmpty() // Trường này không được để trống
    gender: string; // Giới tính của người dùng
}

// DTO để đăng nhập người dùng
export class UserLoginDto {
    @IsString() // Trường này phải là kiểu chuỗi
    @IsNotEmpty() // Trường này không được để trống
    @ApiProperty({ example: 'admin@gmail', description: 'username' }) // Mô tả trường này trong tài liệu Swagger
    readonly username: string; // Tên đăng nhập

    @IsString() // Trường này phải là kiểu chuỗi
    @IsNotEmpty() // Trường này không được để trống
    @ApiProperty({
        example: '123456',
        description: 'password',
    }) // Mô tả trường này trong tài liệu Swagger
    readonly password: string; // Mật khẩu
}

// DTO để xác thực bằng mã code
export class CodeAuthDto {
    @IsNotEmpty() // Trường này không được để trống
    _id: string; // ID người dùng

    @IsNotEmpty() // Trường này không được để trống
    code: string; // Mã xác thực
}

// DTO để thay đổi mật khẩu
export class ChangePasswordDto {
    @IsNotEmpty() // Trường này không được để trống
    currentPassword: string; // Mật khẩu hiện tại

    @IsNotEmpty() // Trường này không được để trống
    newPassword: string; // Mật khẩu mới
}

// DTO để thay đổi mật khẩu qua mã xác thực
export class ChangePasswordAuthDto {
    @IsNotEmpty({ message: "code không được để trống" }) // Trường này không được để trống, thông báo lỗi tùy chỉnh
    code: string; // Mã xác thực

    @IsNotEmpty({ message: "password không được để trống" }) // Trường này không được để trống, thông báo lỗi tùy chỉnh
    password: string; // Mật khẩu mới

    @IsNotEmpty({ message: "confirmPassword không được để trống" }) // Trường này không được để trống, thông báo lỗi tùy chỉnh
    confirmPassword: string; // Xác nhận mật khẩu mới

    @IsNotEmpty({ message: "email không được để trống" }) // Trường này không được để trống, thông báo lỗi tùy chỉnh
    email: string; // Email xác thực
}
