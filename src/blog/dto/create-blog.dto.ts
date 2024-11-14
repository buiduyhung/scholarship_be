import { Transform } from "class-transformer";
import { IsDate, IsMongoId, IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";
import mongoose from "mongoose";


export class CreateBlogDto {
    // Data Transfer Object for creating a new blog post, with validation rules
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    image: string;

    @IsNotEmpty()
    description: string;
}

