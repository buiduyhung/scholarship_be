import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Scholarship } from 'src/scholarship/schemas/scholarship.schemas';

export type ResumeDocument = HydratedDocument<Resume>;
export enum ResumeStatus {
  PENDING = 'PENDING', // Waiting for payment
  PAID = 'PAID', // Payment received, waiting for approval
  REJECTED = 'REJECTED', // Rejected
  REVIEWING = 'REVIEWING', // In reviewing
  DONE = 'DONE', // Approved
}
@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;

  @Prop()
  name: string;

  @Prop()
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  urlCV: string;

  @Prop({
    type: String,
    enum: ResumeStatus,
  })
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Scholarship.name })
  scholarship: mongoose.Schema.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.Array })
  history: {
    status: keyof typeof ResumeStatus;
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
