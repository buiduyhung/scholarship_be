import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Provider } from 'src/provider/schemas/providers.schemas';

export type ScholarshipDocument = HydratedDocument<Scholarship> & {
    provider?: Provider; // Optional populated provider
};

@Schema({ timestamps: true })
export class Scholarship {
    @Prop()
    name: string;

    @Prop()
    image: string[];

    @Prop()
    location: string;

    @Prop()
    type: string;

    @Prop()
    level: string[];

    @Prop()
    subject: string[];

    @Prop()
    quantity: number;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;

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