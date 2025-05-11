import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICustomer } from 'src/interfaces/models.interface';
import { IResponseLogin } from 'src/interfaces/response.interface';
import { TokenService } from 'src/libs/token/token.service';
import { Repository } from 'typeorm';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerEntity } from './entities/customer.entity';
import Exception from 'src/message-validations/exception.validation';

@Injectable()
export class CustomerService {
  constructor(
    @Inject(forwardRef(() => TokenService))
    private tokenService: TokenService,

    @InjectRepository(CustomerEntity)
    private customerRepository: Repository<CustomerEntity>,
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

  findAll() {
    return `This action returns all customer`;
  }

  async findOneById(id: string): Promise<CustomerEntity> {
    const findItem = await this.customerRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Customer'));
    }
    return findItem;
  }

  update(id: number, updateCustomerDto: UpdateCustomerDto) {
    return `This action updates a #${id} customer`;
  }

  remove(id: number) {
    return `This action removes a #${id} customer`;
  }
}
