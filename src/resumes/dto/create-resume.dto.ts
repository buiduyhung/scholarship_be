import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";


export class CreateResumeDto {

    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    urlCV: string;

    @IsOptional()
    urlLetter: string;

    @IsNotEmpty()
    status: string;

    @IsNotEmpty()
    provider: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    scholarship: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {

    @IsNotEmpty()
    urlCV: string;

    @IsOptional()
    urlLetter: string;

    @IsNotEmpty()
    @IsMongoId()
    provider: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    scholarship: mongoose.Schema.Types.ObjectId;

}