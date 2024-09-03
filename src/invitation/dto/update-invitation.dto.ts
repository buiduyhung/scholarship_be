import { PartialType } from '@nestjs/mapped-types';
import { CreateInvitationDto } from './create-invitation.dto';
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

    @IsNotEmpty()
    updatedAt: Date;

    @ValidateNested()
    @IsNotEmpty()
    @Type(() => UpdateBy)
    updatedBy: UpdateBy;
}

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {
    @IsNotEmpty()
    @IsArray()
    @ValidateNested()
    @Type(() => History)
    history: History[];
}