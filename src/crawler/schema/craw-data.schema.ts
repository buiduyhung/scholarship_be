import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
export type CrawDataDocument = HydratedDocument<CrawData>;

@Schema({ timestamps: true })
export class CrawData {
  @Prop({ type: String, required: true, unique: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  href: string;

  @Prop()
  description: string;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;
}

export const CrawDataSchema = SchemaFactory.createForClass(CrawData);
