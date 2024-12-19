import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { GoogleOauthGuard } from 'src/auth/google-auth.guard';
import { Public, ResponseMessage, SkipCheckPermission, User } from 'src/decorator/customize';
import { RolesService } from 'src/roles/roles.service';
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  RegisterUserDto,
  UserLoginDto,
} from 'src/users/dto/create-user.dto';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private authService: AuthService,
    private rolesService: RolesService,
    private usersService: UsersService,
    private configService: ConfigService,
  ) { }

  @Public()
  @ResponseMessage('Login user')
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: UserLoginDto })
  @Post('/login')
  handleLogin(@Req() req, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user, response);
  }

  @Get('google')
  @Public()
  @UseGuards(GoogleOauthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  async auth() { }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  @ResponseMessage('Login with google')
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    this.logger.debug('User login', req.user);
    let user: Record<string, any> = await this.usersService.findOneByUsername(
      req.user.email,
    );
    if (!user) {
      this.logger.debug('User not found, register new user');
      user = await this.usersService.registerGoogle({
        address: '',
        age: 0,
        email: req.user.email,
        name: req.user.name,
        password: '',
        gender: 'MALE',
        phone: 0,
      });
    }
    const permission = await this.rolesService.findOne(user.role._id);
    user['permissions'] = permission.permissions;
    const { access_token, user: _user } = await this.authService.login(
      user as IUser,
      res,
    );
    this.logger.debug('User login success', _user);
    return res.redirect(
      `${this.configService.get('GOOGLE_REDIRECT_URL')}?token=${access_token}&user=${JSON.stringify(_user)}`,
    );
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('/register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @Public()
  @ResponseMessage('Check code')
  @Post('check-code')
  checkCode(@Body() registerUserDto: CodeAuthDto) {
    return this.authService.checkCode(registerUserDto);
  }

  @Post('retry-active')
  @ResponseMessage('Retry active code')
  @Public()
  retryActive(@Body('email') email: string) {
    return this.authService.retryActive(email);
  }

  @Post('retry-password')
  @ResponseMessage('Retry password code')
  @Public()
  retryPassword(@Body('email') email: string) {
    return this.authService.retryPassword(email);
  }

  @Post('forgot-password')
  @ResponseMessage('Forgot password')
  @Public()
  forgotPassword(@Body() data: ChangePasswordAuthDto) {
    return this.authService.forgotPassword(data);
  }

  @ResponseMessage('Get user information')
  @SkipCheckPermission()
  @UseGuards(ThrottlerGuard)
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    if (!user) return null;
    const temp = (await this.rolesService.findOne(user.role._id)) as any;
    return temp;
  }

  @Public()
  @ResponseMessage('Get user by refresh token') //check refreshToken hop le
  @Get('/refresh')
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = request.cookies['refresh_token'];

    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage('Logout User')
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser,
  ) {
    return this.authService.logout(response, user);
  }
}
