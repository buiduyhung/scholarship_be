import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Conversation } from 'src/chat/schema/conversation.schema';
import { User } from 'src/users/schemas/user.schema';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name })
  sender: string;

  @Prop()
  text: string;

  @Prop({ type: [mongoose.Schema.Types.String], default: [] })
  files: string[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Conversation.name })
  conversation: string;

  @Prop()
  sentAt: Date;

  @Prop()
  updateAt: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
