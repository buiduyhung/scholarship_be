import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Provider } from 'src/provider/schemas/providers.schemas';
import { Role } from 'src/roles/schemas/role.schemas';

// Tạo kiểu tài liệu của User từ class User
export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true }) // Bật tự động thêm `createdAt` và `updatedAt`
export class User {
    @Prop({ required: true }) // Trường email là bắt buộc
    email: string;

    @Prop({ required: true }) // Trường password là bắt buộc
    password: string;

    @Prop() // Tên người dùng (không bắt buộc)
    name: string;

    @Prop() // Ảnh đại diện người dùng
    avatar: string;

    @Prop() // Số điện thoại người dùng
    phone: string;

    @Prop() // Giới tính người dùng
    gender: string;

    @Prop() // Tuổi của người dùng
    age: number;

    @Prop() // Địa chỉ của người dùng
    address: string;

    @Prop({ default: false }) // Trạng thái kích hoạt tài khoản, mặc định là `false`
    isActive: boolean;

    @Prop() // Mã xác thực
    codeId: string;

    @Prop() // Thời gian hết hạn mã xác thực
    codeExpired: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name }) // Liên kết với Role qua ObjectId
    role: mongoose.Schema.Types.ObjectId;

    @Prop() // Refresh token dùng cho quản lý phiên
    refreshToken: string;

    @Prop({ type: Object }) // Thông tin người tạo tài liệu
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object }) // Thông tin người cập nhật tài liệu
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object }) // Thông tin người xóa tài liệu
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    };

    @Prop() // Thời gian tạo tài liệu (do schema tự động thêm)
    createdAt: Date;

    @Prop() // Thời gian cập nhật tài liệu (do schema tự động thêm)
    updateAt: Date;
}

// Tạo schema MongoDB từ class User
export const UserSchema = SchemaFactory.createForClass(User);
