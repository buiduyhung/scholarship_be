import { IsArray, IsMongoId, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreateQuizDto {
    @IsNotEmpty()
    title: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    @IsMongoId({ each: true, message: 'question is a mongo object id', })
    @IsArray()
    question: mongoose.Schema.Types.ObjectId[];

    @IsNotEmpty()
    type: string;
}