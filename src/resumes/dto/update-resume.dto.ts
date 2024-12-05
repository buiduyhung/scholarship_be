import { PartialType } from '@nestjs/mapped-types';
import { CreateResumeDto } from './create-resume.dto';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';

class UpdateBy {
    @IsNotEmpty()
    _id: Types.ObjectId;

    @IsNotEmpty()
    @IsEmail()
    email: Types.ObjectId;
}


class History {
    @IsNotEmpty()
    status: string;

    @IsOptional()
    urlCV: string;

    @IsOptional()
    note: string;

    @IsNotEmpty()
    updatedAt: Date;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UpdateBy)
    updatedBy: UpdateBy;
}

export class UpdateResumeDto extends PartialType(CreateResumeDto) {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested()
    @Type(() => History)
    history: History[];
}