import { Transform, Type } from 'class-transformer';
import { IsArray, IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsString, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';



export class CreateScholarshipDto {
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

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    level: string[];

    @IsOptional()
    @IsNotEmpty()
    quantity: number;

    @IsNotEmpty()
    description: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    major: string[];

    @IsOptional()
    isActive: boolean;
}

