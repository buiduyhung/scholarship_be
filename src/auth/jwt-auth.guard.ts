import {
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY, IS_PUBLIC_PERMISSION } from 'src/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }
        return super.canActivate(context);
    }

    handleRequest(err, user, info, context: ExecutionContext) {
        const request: Request = context.switchToHttp().getRequest();

        // Kiểm tra nếu endpoint được đánh dấu là bỏ qua quyền
        const isSkipPermission = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_PERMISSION, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (err || !user) {
            throw err || new UnauthorizedException('Token không hợp lệ hoặc thiếu token.');
        }

        // Nếu bỏ qua kiểm tra quyền, cho phép truy cập
        if (isSkipPermission) {
            return user;
        }

        // Kiểm tra quyền nếu endpoint yêu cầu
        const targetMethod = request.method;
        const targetEndpoint = request.route?.path as string;
        const permissions = user?.permissions ?? [];

        const isExist = permissions.find(
            (permission) =>
                targetMethod === permission.method &&
                targetEndpoint === permission.apiPath,
        );

        if (!isExist) {
            throw new ForbiddenException('Bạn không có quyền để truy cập endpoint này!');
        }

        return user;
    }
}
