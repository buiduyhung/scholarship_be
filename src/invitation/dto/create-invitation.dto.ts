import { IsMongoId, IsNotEmpty, IsOptional } from "class-validator";
import mongoose from "mongoose";


export class CreateInvitationDto {

    @IsNotEmpty()
    emailReceiver: string;

    @IsNotEmpty()
    description: string;


}