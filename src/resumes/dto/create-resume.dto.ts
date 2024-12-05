import { IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";


export class CreateResumeDto {

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsString()
    urlCV: string;

    @IsNotEmpty()
    status: string;

    @IsNotEmpty()
    staff: string;

    @IsNotEmpty()
    note: string;

    @IsNotEmpty()
    scholarship: mongoose.Schema.Types.ObjectId;

}

export class CreateUserCvDto {

    @IsOptional()
    @IsString()
    urlCV: string;

    @IsNotEmpty()
    @IsMongoId()
    scholarship: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    staff: string;

    @IsOptional()
    note: string;

}