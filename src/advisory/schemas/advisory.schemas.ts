import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProviderDocument = HydratedDocument<Provider>;

@Schema({ timestamps: true })
export class Provider {
    @Prop()
    email: string;

    @Prop()
    fullName: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    time: number;

    @Prop()
    level: number;

    @Prop()
    pay: number;

    @Prop()
    status: string;

    @Prop()
    his: string;

    @Prop()
    part: string;

    @Prop()
    background: string;

    @Prop()
    gallery: string[];

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

export const ProviderSchema = SchemaFactory.createForClass(Provider);