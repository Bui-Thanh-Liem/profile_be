import { Injectable, Logger } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { Repository } from 'typeorm';
import { CustomerService } from 'src/routers/customer/customer.service';
import { SubjectItemService } from '../subject-item/subject-item.service';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);

  constructor(
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    private customerService: CustomerService,
    private subjectItemService: SubjectItemService,
  ) {}

  async create(payload: CreateLikeDto) {
    //
    const customer = await this.customerService.findOneById(payload.customerId);
    const subjectItem = await this.subjectItemService.findOneById(payload.subjectItemId);

    //
    const dataCreate = this.likeRepository.create({
      ...payload,
      customerId: customer,
      subjectItemId: subjectItem,
      createdBy: null,
    });
    const newItem = await this.likeRepository.save(dataCreate);

    return newItem;
  }

  findAll() {
    return `This action returns all like`;
  }

  findOne(id: number) {
    return `This action returns a #${id} like`;
  }

  update(id: number, updateLikeDto: UpdateLikeDto) {
    return `This action updates a #${id} like`;
  }

  remove(id: number) {
    return `This action removes a #${id} like`;
  }
}
