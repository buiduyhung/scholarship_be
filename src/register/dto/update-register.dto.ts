import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { CreateRegisterDto } from './create-register.dto';

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
    message: string;

    @IsNotEmpty()
    updatedAt: Date;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UpdateBy)
    updatedBy: UpdateBy;
}

export class UpdateRegisterDto extends PartialType(CreateRegisterDto) {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested()
    @Type(() => History)
    history: History[];
}