import { IsArray, IsNotEmpty } from 'class-validator';

export class CreateMessageDto {
  @IsNotEmpty()
  text: string;

  @IsArray()
  files: {
    name: string; // include extension
    buffer: Buffer;
  }[];
}
