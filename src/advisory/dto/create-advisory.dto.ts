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
    phone: string;

    @IsNotEmpty()
    address: string;

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


}
