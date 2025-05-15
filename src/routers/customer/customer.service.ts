import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService, IFindAllService } from 'src/interfaces/common.interface';
import { ICustomer } from 'src/interfaces/models.interface';
import { IGetMulti, IResponseLogin } from 'src/interfaces/response.interface';
import { QueueSmsService } from 'src/libs/bull/queue-sms/queue-sms.service';
import { TokenService } from 'src/libs/token/token.service';
import Exception from 'src/message-validations/exception.validation';
import { UtilBuilder } from 'src/utils/Builder.util';
import { Repository } from 'typeorm';
import { VerifyRegisterDto } from './dto/verifyRegister-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import { QueueMailService } from 'src/libs/bull/queue-mail/queue-mail.service';
import { OtpService } from 'src/helpers/services/Otp.service';
import { Enums } from 'liemdev-profile-lib';
import { VerifyOtpDto } from './dto/verifyOtp-customer.dto';
import { CacheService } from 'src/helpers/services/cache.service';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);

  constructor(
    @Inject(forwardRef(() => TokenService))
    private tokenService: TokenService,

    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,

    private queueSmsService: QueueSmsService,
    private queueMailService: QueueMailService,
    private otpService: OtpService,
    private cacheService: CacheService,
  ) {}

  async registerOrLoginGg(
    payload: Partial<ICustomer>,
    deviceInfo: string,
    ipAddress: string,
  ): Promise<IResponseLogin<any>> {
    const { email, fullName, avatar } = payload;

    // Lần 2 gọi là đăng nhập
    const checkRegistered = await this.customerRepository.findOneBy({ email });
    if (checkRegistered) {
      //
      delete checkRegistered.password;

      //
      const tokens = await this.tokenService.signToken({
        customer: checkRegistered,
        deviceInfo,
        ipAddress,
      });
      return { customer: checkRegistered, user: null, token: tokens };
    }

    // Lần đầu gọi là đăng kí
    const dataCreate = this.customerRepository.create({
      email,
      fullName,
      avatar,
    });
    const newItem = await this.customerRepository.save(dataCreate);

    //
    const tokens = await this.tokenService.signToken({
      customer: newItem,
      deviceInfo,
      ipAddress,
    });
    return { customer: newItem, user: null, token: tokens };
  }

  async verifyRegister({ payload, activeUser }: ICreateService<VerifyRegisterDto>): Promise<boolean> {
    const { email: emailPayload, fullName, phone } = payload;

    // Check exist email
    const findItemByEmail = await this.customerRepository.findOneBy({
      email: emailPayload,
    });
    if (findItemByEmail) {
      throw new ConflictException(Exception.exists('Email'));
    }

    // Check exist fullname
    const findItemByFullname = await this.customerRepository.findOneBy({
      fullName,
    });
    if (findItemByFullname) {
      throw new ConflictException(Exception.exists('Fullname'));
    }

    // Check exist phone
    const findItemByPhone = await this.customerRepository.findOneBy({ phone });
    if (findItemByPhone) {
      throw new ConflictException(Exception.exists('Phone'));
    }

    if (phone) {
      await this.queueSmsService.sendOtp({ phone: phone });
      await this.cacheService.setCache(phone, payload, 60 * 2000);
    } else if (emailPayload) {
      const otp = await this.otpService.setOtp(emailPayload);
      await this.queueMailService.sendMail({
        to: emailPayload,
        subject: '"LiemDev 👻" <no-reply@gmail.com>',
        templateName: 'otp.template',
        variables: {
          rootLogo: `${process.env.CLIENT_HOST}/logo.png`,
          rootUrlWeb: `${process.env.CLIENT_HOST}`,
          requestTime: new Date(),
          otpCode: otp,
          fullName: fullName,
          expiryMinutes: 2,
        },
        type: Enums.ETypeMail.FORM_OTP,
      });
      await this.cacheService.setCache(emailPayload, payload, 60 * 2000);
    }
    return true;
  }

  async verifyOtpAndCreateCustomer({ code, email, phone }: VerifyOtpDto) {
    let payload: CustomerEntity | null = null;
    const otpPhone = await this.otpService.getOtp(phone);
    const otpEmail = await this.otpService.getOtp(email);

    if (otpPhone) {
      if (otpPhone !== code) {
        this.logger.debug('Người dùng nhập sai otp');
        throw new UnauthorizedException(Exception.invalid('OTP, please again !'));
      }

      //
      payload = await this.cacheService.getCache(phone);
      await this.cacheService.deleteCache(phone);
    } else if (otpEmail) {
      if (otpEmail !== code) {
        this.logger.debug('Người dùng nhập sai otp');
        throw new UnauthorizedException(Exception.invalid('OTP, please again !'));
      }

      //
      payload = await this.cacheService.getCache(email);
      await this.cacheService.deleteCache(email);
    }

    const dataCreate = this.customerRepository.create({
      ...payload,
    });
    return await this.customerRepository.save(dataCreate);
  }

  async logout(refreshToken: string) {
    try {
      this.tokenService.verifyAccessToken(refreshToken);

      // 1. Thu hồi token để kiểm tra lịch sử đăng nhập
      const revoked = await this.tokenService.revokeToken({ refreshToken: refreshToken });
      if (!revoked) {
        throw new BadRequestException('Revoke token fail');
      }

      // 2. Xoá token khỏi trong database luôn
      /**
       * code
       */
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findAll({ queries, activeUser }: IFindAllService<CustomerEntity>): Promise<IGetMulti<CustomerEntity>> {
    //
    const queryBuilder = new UtilBuilder<CustomerEntity>(this.customerRepository, {
      excludeJoin: ['tokens'],
      // exclude: ['email'],
    });
    const { items, totalItems } = await queryBuilder.handleConditionQueries({
      queries,
      user: null,
      searchField: 'fullName',
    });

    return {
      items,
      totalItems,
    };
  }

  async findOneById(id: string): Promise<CustomerEntity> {
    const findItem = await this.customerRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Customer'));
    }
    return findItem;
  }
}
