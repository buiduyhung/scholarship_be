import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ScholarshipDocument = HydratedDocument<Scholarship>;

@Schema({ timestamps: true })
export class Scholarship {
    @Prop()
    name: string;

    @Prop()
    fundingMethod: string;

    @Prop()
    location: string;

    @Prop()
    level: string;

    @Prop()
    value: number;

    @Prop()
    quantity: number;

    @Prop()
    description: string;

    @Prop()
    type: string;

    @Prop()
    startDate: Date;

    @Prop()
    endDate: Date;

    @Prop()
    isActive: boolean;

    @Prop({ type: Object })
    provider: {
        _id: mongoose.Schema.Types.ObjectId;
        name: string;
    };

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

    @Prop()
    createdAt: Date;

    @Prop()
    updateAt: Date;
}

export const ScholarshipSchema = SchemaFactory.createForClass(Scholarship);