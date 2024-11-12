import { CanActivate, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class WsGuard implements CanActivate {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  private extractToken(context: any): string {
    const queryToken = context.args[0].handshake.query.token;
    if (queryToken) {
      return queryToken;
    }

    return (
      context.args[0].handshake.auth.token ??
      context.args[0].handshake.headers.authorization.split(' ')[1]
    );
  }

  canActivate(
    context: any,
  ): boolean | any | Promise<boolean | any> | Observable<boolean | any> {
    const bearerToken = this.extractToken(context);

    try {
      const decoded = this.jwtService.verify(bearerToken) as any;
      return new Promise((resolve, reject) => {
        return this.userService
          .findOneByUsername(decoded.email)
          .then((user) => {
            if (user) {
              context.args[0].user = user;
              context.user = user;
              resolve(user);
            } else {
              reject(false);
            }
          });
      });
    } catch (ex) {
      console.log(ex);
      return false;
    }
  }
}
