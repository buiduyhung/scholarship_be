import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Question } from 'src/question/schemas/question.schemas';

export type QuizDocument = HydratedDocument<Quiz>;

@Schema({ timestamps: true })
export class Quiz {
    @Prop()
    title: string;

    @Prop()
    description: string;

    @Prop(({ type: [mongoose.Schema.Types.ObjectId], ref: Question.name }))
    question: Question[];

    @Prop()
    type: string;

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

export const QuizSchema = SchemaFactory.createForClass(Quiz);