import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";


export class CreateRegisterDto {

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsString({ each: true })
    @IsArray()
    url: string[];

    @IsNotEmpty()
    status: string;

    @IsOptional()
    message: string;

}

export class CreateProviderFileDto {

    @IsNotEmpty()
    @IsString({ each: true })
    @IsArray()
    url: string[];

}