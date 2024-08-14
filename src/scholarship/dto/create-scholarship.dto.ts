import { Transform, Type } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNotEmptyObject, IsNumber, IsObject, IsPhoneNumber, Max, Min, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Provider { //validate obj provider
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    logo: string;
}

export class CreateScholarshipDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    fundingMethod: string;

    @IsNotEmpty()
    location: string;

    @IsNotEmpty()
    level: string;

    @IsNotEmpty()
    value: number;

    @IsNotEmpty()
    quantity: number;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    type: string;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate: Date;

    @IsNotEmpty()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate: Date;

    @IsNotEmpty()
    isActive: boolean;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Provider)
    provider: Provider;  // validate provider

}

