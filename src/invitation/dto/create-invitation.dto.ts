import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";


export class CreateInvitationDto {

    @IsOptional()
    urlInvite: string;

    @IsNotEmpty()
    emailReceiver: string;

    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    urlCV: string;
}