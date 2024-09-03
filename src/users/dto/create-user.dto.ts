import { Type } from 'class-transformer';
import { IsEmail, IsMongoId, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPhoneNumber, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

// class Provider { //validate obj provider
//     @IsNotEmpty()
//     _id: mongoose.Schema.Types.ObjectId;

//     @IsNotEmpty()
//     name: string;
// }

export class CreateUserDto { //admin
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsOptional()
    avatar: string;

    @IsNotEmpty()
    age: number;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: number;

    @IsNotEmpty()
    gender: string;

    @IsNotEmpty()
    @IsMongoId()
    role: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    provider: mongoose.Schema.Types.ObjectId;

}

export class RegisterUserDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    password: string;

    @IsNotEmpty()
    age: number;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: number;

    @IsNotEmpty()
    gender: string;

}

export class ChangePasswordDto {
    @IsNotEmpty()
    currentPassword: string;

    @IsNotEmpty()
    newPassword: string;
}
