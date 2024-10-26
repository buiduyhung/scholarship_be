import { IsMongoId, IsNotEmpty } from 'class-validator';
import mongoose from 'mongoose';

export class CreateResumeDto {
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  userId: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  urlCV: string;

  @IsNotEmpty()
  status: string;

  @IsNotEmpty()
  scholarship: mongoose.Schema.Types.ObjectId;
}

export class CreateUserCvDto {
  @IsNotEmpty()
  urlCV: string;

  @IsNotEmpty()
  @IsMongoId()
  scholarship: mongoose.Schema.Types.ObjectId;
}
