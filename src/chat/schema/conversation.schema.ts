import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { User } from 'src/users/schemas/user.schema';
export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ timestamps: true })
export class Conversation {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  user: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  staff: string;

  @Prop()
  status: boolean;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);
