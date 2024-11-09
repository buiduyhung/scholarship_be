import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ timestamps: true })
export class Question {
    @Prop()
    question: string;

    @Prop()
    option: string[];

    @Prop()
    answer: string;

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

export const QuestionSchema = SchemaFactory.createForClass(Question);