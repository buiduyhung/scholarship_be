import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop()
    name: string;

    @Prop()
    phone: number;

    @Prop()
    gender: string;

    @Prop()
    age: number;

    @Prop()
    address: string;

    @Prop()
    role: string;

    @Prop()
    refreshToken: string;

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

export const UserSchema = SchemaFactory.createForClass(User);