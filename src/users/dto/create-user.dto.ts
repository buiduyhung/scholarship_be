import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsPhoneNumber, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Provider { //validate obj provider
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;
}

export class CreateUserDto { //admin
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

    @IsNotEmpty()
    role: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Provider)
    provider: Provider;  // validate provider

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
