import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CrawScheduleDocument = HydratedDocument<CrawSchedule>;
export enum ScheduleStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true })
export class CrawSchedule {
  @Prop({ type: String, required: true })
  name: string;

  @Prop({
    type: String,
    enum: ScheduleStatus,
  })
  status: ScheduleStatus;

  @Prop({
    type: Number,
    required: true,
  })
  takePerCraw: number; // Number of pages to take per craw

  @Prop({ type: Number, required: true })
  lastPage: number; // Last page that has been crawled, start from 1

  @Prop({ type: Number, default: 0 })
  lastTotal: number; // Last total of page

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const CrawScheduleSchema = SchemaFactory.createForClass(CrawSchedule);
