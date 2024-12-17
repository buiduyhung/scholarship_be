import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Scholarship } from 'src/scholarship/schemas/scholarship.schemas';
import { User } from 'src/users/schemas/user.schema';

export type ResumeDocument = HydratedDocument<Resume>;

@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  note: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  userId: mongoose.Schema.Types.ObjectId;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
  })
  staff: mongoose.Schema.Types.ObjectId;

  @Prop()
  urlCV: string;

  @Prop()
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Scholarship.name })
  scholarship: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Array })
  history: {
    status: string;
    updatedAt: Date;
    updatedBy: {
      _id: mongoose.Schema.Types.ObjectId;
      email: string;
    };
  }[];

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    email: string;
  };

  @Prop({ type: Number, unique: true, required: true })
  orderCode: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
