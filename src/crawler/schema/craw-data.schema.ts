import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { CrawSchedule } from 'src/crawler/schema/craw-schedule.schema';
export type CrawDataDocument = HydratedDocument<CrawData>;

@Schema({ timestamps: true })
export class CrawData {
  @Prop({ type: String, required: true, unique: true })
  title: string;

  @Prop({ type: String, required: true, unique: true })
  href: string;

  @Prop()
  description: string;

  @Prop({
    default: false,
  })
  isAdded: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: CrawSchedule.name,
  })
  schedule: CrawSchedule;

  @Prop()
  createdAt: Date;

  @Prop()
  updateAt: Date;
}

export const CrawDataSchema = SchemaFactory.createForClass(CrawData);
