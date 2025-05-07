import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Constants, Utils } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { CONSTANT_TOKEN } from 'src/constants';
import { Public } from 'src/decorators/public.decorator';
import { CookieService } from 'src/helpers/services/Cookie.service';
import { IUser } from 'src/interfaces/models.interface';
import Exception from 'src/message-validations/exception.validation';
import { AuthService } from './auth.service';
import { ConfirmOtpDto } from './dto/confirm-otp.dto';
import { EnterEmailDto } from './dto/enter-email.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { LocalAuthGuard } from './strategy-local/local-auth.guard';

@Controller(Constants.CONSTANT_ROUTE.AUTH)
export class AuthController {
  maxAge_access = Utils.UtilConvert.convertToSecond('DAY', 3) * 1000; //  ms
  maxAge_refresh = Utils.UtilConvert.convertToSecond('DAY', 7) * 1000;

  constructor(
    private authService: AuthService,
    private cookieService: CookieService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard) // validation email, password
  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Body() payload: LoginAuthDto,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ip: string,
  ) {
    //
    const { user, token } = await this.authService.login(
      req.user as Omit<IUser, 'password'>, // LocalAuthGuard
      userAgent,
      ip || req.ip,
    );

    // Set Authorization Header
    // res.setHeader('Authorization', `Bearer ${result.token.access_token}`);
    // res.setHeader('Access-Control-Expose-Headers', 'Authorization');

    // Set cookie
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER}`,
      value: token.access_token,
      maxAge: this.maxAge_access,
      res,
    });
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER_RF}`,
      value: token.refresh_token,
      maxAge: this.maxAge_refresh,
      res,
    });

    res.status(HttpStatus.OK).send(
      new ResponseSuccess('Success', {
        user,
        token,
      }),
    );
  }

  @Public()
  @HttpCode(HttpStatus.OK) // status code mặc định trả về cho endpoint này
  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies[`${CONSTANT_TOKEN.TOKEN_NAME_USER_RF}`];
    if (!refreshToken) {
      throw new NotFoundException(Exception.notfound('Refresh token'));
    }

    const { access_token, refresh_token } = await this.authService.refreshToken(refreshToken);

    // Set cookie
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER}`,
      value: access_token,
      maxAge: this.maxAge_access,
      res,
    });
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER_RF}`,
      value: refresh_token,
      maxAge: this.maxAge_refresh,
      res,
    });

    res.status(HttpStatus.OK).json(new ResponseSuccess('Success', true));
  }

  @Post('logout')
  // async logout(@Headers('authorization') auth: string, @Res() res: Response) {
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies[`${CONSTANT_TOKEN.TOKEN_NAME_USER_RF}`];
    if (!refreshToken) {
      throw new NotFoundException(Exception.notfound('Refresh token'));
    }
    await this.authService.logout(refreshToken);

    // Clear cookie
    this.cookieService.clearCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER}`,
      res,
    });
    this.cookieService.clearCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_USER_RF}`,
      res,
    });

    res.status(HttpStatus.OK).send(new ResponseSuccess('Success', true));
  }

  @Public()
  @Post('enter-email')
  async enterEmail(
    @Res() res: Response,
    @Body() enterEmailDto: EnterEmailDto,
    @Headers('user-agent') userAgent,
    @Headers('x-forwarded-for') ip,
  ) {
    const result = await this.authService.enterEmail(enterEmailDto.email, userAgent, ip);

    return new ResponseSuccess('Success, please check your email', result);
  }

  @Public()
  @Post('confirm-otp/:token')
  async confirmOtp(
    @Param('token') token: string,
    @Res() res: Response,
    @Body() confirmOtpDto: ConfirmOtpDto,
    @Headers('user-agent') userAgent,
    @Headers('x-forwarded-for') ip,
  ) {
    const result = await this.authService.confirmOtp(confirmOtpDto.otp, token, userAgent, ip);

    return new ResponseSuccess('Success', result);
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Query() queries: any,
    @Res() res: Response,
    @Body() resetPasswordDto: ResetPasswordDto,
    @Headers('user-agent') userAgent,
    @Headers('x-forwarded-for') ip,
  ) {
    const result = await this.authService.resetPassword(resetPasswordDto.password, queries.token, userAgent, ip);

    return new ResponseSuccess('Success', result);
  }

  @Get('me')
  getMe(@Req() req: Request) {
    return new ResponseSuccess('Success', req.user);
  }
}
