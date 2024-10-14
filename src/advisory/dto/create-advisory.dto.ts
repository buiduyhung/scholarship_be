import { Transform } from "class-transformer";
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";
import mongoose from "mongoose";


export class CreateAdvisoryDto {
    @IsNotEmpty()
    emailAdvisory: string;

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: number;

    @IsNotEmpty()
    address: string;

    @IsNotEmpty()
    time: string;

    @IsNotEmpty()
    level: string;

    @IsNotEmpty()
    pay: string;

    @IsNotEmpty()
    status: string;
}


export class CreateUserAdvisoryDto {

    @IsNotEmpty()
    emailAdvisory: string;

    @IsNotEmpty()
    fullName: string;

    @IsNotEmpty()
    @IsPhoneNumber('VN')
    phone: number;

    @IsNotEmpty()
    address: string;

    @Transform(({ value }) => new Date(value))
    @IsDate()
    time: Date;

    @IsNotEmpty()
    level: string;

    @IsNotEmpty()
    pay: string;

}
