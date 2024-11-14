import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog {
    // The name of the blog post
    @Prop()
    name: string;

    // URL or path to the blog image
    @Prop()
    image: string;

    @Prop()
    email: string;

    @Prop()
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    description: string;

    @Prop({ default: true })
    isActive: boolean;

    // Information about the user who created this blog post
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

export const BlogSchema = SchemaFactory.createForClass(Blog);
