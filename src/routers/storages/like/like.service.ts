import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CustomerService } from 'src/routers/customer/customer.service';
import { Repository } from 'typeorm';
import { KnowledgeService } from '../knowledge/knowledge.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { LikeEntity } from './entities/like.entity';

@Injectable()
export class LikeService {
  private readonly logger = new Logger(LikeService.name);

  constructor(
    @InjectRepository(LikeEntity)
    private likeRepository: Repository<LikeEntity>,
    private customerService: CustomerService,
    private knowledgeService: KnowledgeService,
  ) {}

  async create(payload: CreateLikeDto) {
    //
    const customer = await this.customerService.findOneById(payload.customerId);
    const knowledge = await this.knowledgeService.findOneById(payload.knowledgeId);

    //
    const dataCreate = this.likeRepository.create({
      ...payload,
      customerId: customer,
      knowledgeId: knowledge,
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
