import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type NewsDocument = HydratedDocument<News>;

@Schema({ timestamps: true })
export class News {
  @Prop({ type: String })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  url: string;

  @Prop()
  description: string;

  @Prop({ type: String })
  label: string;

  @Prop({ type: String })
  heroImage?: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;
}

export const NewSchema = SchemaFactory.createForClass(News);
