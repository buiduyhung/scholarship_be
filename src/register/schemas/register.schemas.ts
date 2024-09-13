import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';


export type RegisterDocument = HydratedDocument<Register>;

@Schema({ timestamps: true })
export class Register {
    @Prop()
    email: string;

    @Prop()
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    url: string[];

    @Prop()
    message: string;

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

export const RegisterSchema = SchemaFactory.createForClass(Register);