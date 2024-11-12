import { IsArray, IsNotEmpty, IsString } from "class-validator";

export class CreateQuestionDto {
    @IsNotEmpty()
    question: string;

    @IsNotEmpty()
    @IsArray()
    @IsString({ each: true })
    option: string[];

    @IsNotEmpty()
    answer: string;
}