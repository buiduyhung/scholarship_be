import { IsArray, IsBoolean, IsEmail, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";


export class CreateSubscriberDto {

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    major: string[];

    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    level: string[];

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(9)
    ielts: number;

    @IsOptional()
    @IsNumber()
    @Min(0)
    @Max(4)
    GPA: number;

    @IsOptional()
    @IsNumber()
    pay: number;

    @IsOptional()
    value: string

    @IsOptional()
    location: string
}