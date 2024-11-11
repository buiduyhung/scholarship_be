import { IsArray, IsBoolean, IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";


export class CreateSubscriberDto {

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    major: string[];

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    level: string[];

}