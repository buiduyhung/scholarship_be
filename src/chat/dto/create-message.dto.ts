import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  text: string;

  @IsArray()
  files: string[];
}
