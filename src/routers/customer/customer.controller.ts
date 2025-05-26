import {
  Body,
  Controller,
  Get,
  Headers,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Constants, Utils } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { CONSTANT_TOKEN } from 'src/constants';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Customer } from 'src/decorators/customer.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { CookieService } from 'src/helpers/services/Cookie.service';
import { ICustomer } from 'src/interfaces/models.interface';
import Exception from 'src/message-validations/exception.validation';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CustomerService } from './customer.service';
import { UpdateMeOtpDto } from './dto/updateMe.dto';
import { VerifyOtpDto } from './dto/verifyOtp-customer.dto';
import { VerifyRegisterDto } from './dto/verifyRegister-customer.dto';
import { CustomerEntity } from './entities/customer.entity';

@Controller(Constants.CONSTANT_ROUTE.CUSTOMER)
export class CustomerController {
  maxAge_access = Utils.UtilConvert.convertToSecond('DAY', 3) * 1000; //  ms
  maxAge_refresh = Utils.UtilConvert.convertToSecond('DAY', 7) * 1000;

  constructor(
    private readonly customerService: CustomerService,
    private cookieService: CookieService,
  ) {}

  @Public()
  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ip: string,
  ) {
    const { customer, token } = await this.customerService.registerOrLoginGg(
      req.user as Partial<ICustomer>,
      userAgent,
      ip || req.ip,
    );

    // Set cookie
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER}`,
      value: token.access_token,
      maxAge: this.maxAge_access,
      res,
    });
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER_RF}`,
      value: token.refresh_token,
      maxAge: this.maxAge_refresh,
      res,
    });

    return res.redirect(`${process.env.CLIENT_HOST}/storage?google_login=success`);
  }

  @Public()
  @Get('verify-login-google')
  async verifyLoginGoogle(@Req() req: Request) {
    const customerId = req['customer'];
    const result = await this.customerService.findOneById(customerId);
    return new ResponseSuccess('Success', result);
  }

  @Public()
  @Post('login')
  async login(
    @Req() req: Request,
    @Res() res: Response,
    @Headers('user-agent') userAgent: string,
    @Headers('x-forwarded-for') ip: string,
  ) {
    const { customer, token } = await this.customerService.login(
      req.user as Partial<ICustomer>,
      userAgent,
      ip || req.ip,
    );

    // Set cookie
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER}`,
      value: token.access_token,
      maxAge: this.maxAge_access,
      res,
    });
    this.cookieService.setCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER_RF}`,
      value: token.refresh_token,
      maxAge: this.maxAge_refresh,
      res,
    });

    res.status(HttpStatus.OK).send(
      new ResponseSuccess('Success', {
        customer,
        token,
      }),
    );
  }

  // check email, fullname, phone and send otp
  @Public()
  @Post('verify-register')
  async verifyRegister(@Body() payload: VerifyRegisterDto) {
    const results = await this.customerService.verifyRegister({ payload, activeUser: null });
    return new ResponseSuccess('Success', results);
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() payload: VerifyOtpDto) {
    const results = await this.customerService.verifyOtpAndCreateCustomer(payload);
    return new ResponseSuccess('Success', results);
  }

  @Public()
  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    //
    const refreshToken = req.cookies[`${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER_RF}`];
    if (!refreshToken) {
      throw new NotFoundException(Exception.notfound('Refresh token'));
    }

    //
    await this.customerService.logout(refreshToken);

    // Clear cookie
    this.cookieService.clearCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER}`,
      res,
    });
    this.cookieService.clearCookie({
      name: `${CONSTANT_TOKEN.TOKEN_NAME_CUSTOMER_RF}`,
      res,
    });

    res.status(HttpStatus.OK).send(new ResponseSuccess('Success', true));
  }

  @Get()
  @Roles({ resource: 'customer', action: 'view' })
  async findAll(@Query() queries: AQueries<CustomerEntity>, @ActiveUser() activeUser: TPayloadToken) {
    const { items, totalItems } = await this.customerService.findAll({ queries, activeUser });
    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.customerService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Patch(':id')
  async updateMe(@Param('id') id: string, @Body() payload: UpdateMeOtpDto) {
    const result = await this.customerService.updateMe(id, payload);
    return new ResponseSuccess('Success', result);
  }
}
