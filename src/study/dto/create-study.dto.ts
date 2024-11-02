import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';



export class CreateStudyDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    continent: string;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    image: string[];

    @IsNotEmpty()
    description: string;

    @IsOptional()
    isActive: boolean;
}

