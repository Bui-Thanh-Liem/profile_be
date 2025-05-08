import { Body, Controller, Delete, Get, Headers, Param, Patch, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { Constants, Utils } from 'liemdev-profile-lib';
import { CONSTANT_TOKEN } from 'src/constants';
import { Public } from 'src/decorators/public.decorator';
import { CookieService } from 'src/helpers/services/Cookie.service';
import { ICustomer } from 'src/interfaces/models.interface';
import { CustomerService } from './customer.service';
import { UpdateCustomerDto } from './dto/update-customer.dto';

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

    return res.redirect(`${process.env.CLIENT_HOST}/storage?loginType=google`);
  }

  // @Post()
  // register(@Body() createCustomerDto: CreateCustomerDto) {
  //   return this.customerService.register(createCustomerDto);
  // }

  @Get()
  findAll() {
    return this.customerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
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
