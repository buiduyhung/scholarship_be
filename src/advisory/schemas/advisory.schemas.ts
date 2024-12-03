import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type AdvisoryDocument = HydratedDocument<Advisory>;

@Schema({ timestamps: true })
export class Advisory {
    @Prop()
    emailAdvisory: string;

    @Prop()
    email: string;

    @Prop()
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    fullName: string;

    @Prop()
    phone: string;

    @Prop()
    address: string;

    @Prop()
    continent: string;

    @Prop()
    time: string;

    @Prop()
    value: string;

    @Prop()
    level: string;  //tu dien

    @Prop()
    status: string;

    @Prop({ type: mongoose.Schema.Types.Array })
    history: {
        status: string;
        updatedAt: Date;
        updatedBy: {
            _id: mongoose.Schema.Types.ObjectId;
            email: string;
        };
    }[]

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

export const AdvisorySchema = SchemaFactory.createForClass(Advisory);// Generate schema for the Advisory class