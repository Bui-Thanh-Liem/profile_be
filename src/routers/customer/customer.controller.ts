import { Body, Controller, Delete, Get, Headers, Param, Patch, Query, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Constants, Utils } from 'liemdev-profile-lib';
import { CONSTANT_TOKEN } from 'src/constants';
import { Public } from 'src/decorators/public.decorator';
import { CookieService } from 'src/helpers/services/Cookie.service';
import { ICustomer } from 'src/interfaces/models.interface';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { Customer } from 'src/decorators/customer.decorator';
import { ResponseSuccess } from 'src/classes/response.class';
import { CustomerEntity } from './entities/customer.entity';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';

@Controller(Constants.CONSTANT_ROUTE.CUSTOMER)
export class CustomerController {
  maxAge_access = Utils.UtilConvert.convertToSecond('DAY', 3) * 1000; //  ms
  maxAge_refresh = Utils.UtilConvert.convertToSecond('DAY', 7) * 1000;

  constructor(
    private readonly customerService: CustomerService,
    private cookieService: CookieService,
  ) {}

  @Get('google')
  @Public()
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @Public()
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

  // @Post()
  // register(@Body() createCustomerDto: CreateCustomerDto) {
  //   return this.customerService.register(createCustomerDto);
  // }

  @Get('verify-login-google')
  @Customer()
  async verifyLoginGoogle(@Req() req: Request) {
    const idCustomer = req['customer']?.customerId;
    const result = await this.customerService.findOneById(idCustomer);
    return new ResponseSuccess('Success', result);
  }

  @Get()
  async findAll(@Query() queries: AQueries<CustomerEntity>, @ActiveUser() activeUser: TPayloadToken) {
    const { items, totalItems } = await this.customerService.findAll({ queries, activeUser });
    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.customerService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.customerService.remove(+id);
  }
}
