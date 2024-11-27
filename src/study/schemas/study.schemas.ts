import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type StudyDocument = HydratedDocument<Study>;

@Schema({ timestamps: true })
export class Study {
    @Prop()
    name: string;

    @Prop()
    image: string[];

    @Prop()
    location: string;

    @Prop()
    continent: string;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    // @Prop({ type: Object })
    // updatedBy: {
    //     _id: mongoose.Schema.Types.ObjectId;
    //     email: string;
    // };

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

export const StudySchema = SchemaFactory.createForClass(Study);
