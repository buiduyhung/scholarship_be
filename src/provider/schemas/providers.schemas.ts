import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ProviderDocument = HydratedDocument<Provider>;

@Schema({ timestamps: true })
export class Provider {
    @Prop()
    name: string;

    @Prop()
    address: string;

    @Prop()
    city: string;

    @Prop()
    description: string;

    @Prop()
    quantity: number;

    @Prop()
    topVN: number;

    @Prop()
    topWorld: number;

    @Prop()
    logo: string;

    @Prop()
    info: string;

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