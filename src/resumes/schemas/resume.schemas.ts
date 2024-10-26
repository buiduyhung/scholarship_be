import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Scholarship } from 'src/scholarship/schemas/scholarship.schemas';

export type ResumeDocument = HydratedDocument<Resume>;
export const ResumeStatus = {
  PENDING: 'PENDING', // Waiting for payment
  PAID: 'PAID', // Payment received, waiting for approval
  APPROVED: 'APPROVED', // Approved
  REJECTED: 'REJECTED', // Rejected
  DELETED: 'DELETED', // Rejected by admin or deleted by user
};
@Schema({ timestamps: true })
export class Resume {
  @Prop()
  email: string;

  @Prop()
  userId: mongoose.Schema.Types.ObjectId;

  @Prop()
  urlCV: string;

  @Prop({
    type: String,
    enum: Object.values(ResumeStatus),
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
