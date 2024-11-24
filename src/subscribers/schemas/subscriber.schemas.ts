import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type SubscriberDocument = HydratedDocument<Subscriber>;

@Schema({ timestamps: true })
export class Subscriber {
    @Prop({ required: true })
    email: string;

    @Prop()
    name: string;

    @Prop()
    major: string[];

    @Prop()
    level: string[];

    @Prop()
    location: string;

    @Prop()
    ielts: number;

    @Prop()
    GPA: number;

    @Prop()
    pay: number;

    @Prop()
    value: string;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updateAt: Date;
}

export const SubscriberSchema = SchemaFactory.createForClass(Subscriber);