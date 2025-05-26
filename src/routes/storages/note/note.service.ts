import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/helpers/services/Cache.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { CustomerEntity } from 'src/routes/customer/entities/customer.entity';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { createKeyCustomerActive } from 'src/utils/createKeyCache';
import { DeleteResult, In, Repository } from 'typeorm';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteEntity } from './entities/note.entity';

@Injectable()
export class NoteService {
  constructor(
    private cacheService: CacheService,
    @InjectRepository(NoteEntity)
    private noteRepository: Repository<NoteEntity>,
  ) {}

  async create({ payload, active }: ICreateService<CreateNoteDto>) {
    //
    const key = createKeyCustomerActive(active.customerId);
    const customerActive = await this.cacheService.getCache<CustomerEntity>(key);

    const dataCreate = this.noteRepository.create({ ...payload, customerId: customerActive });
    return await this.noteRepository.save(dataCreate);
  }

  async findAll({ queries, active }: IFindAllService<NoteEntity>): Promise<IGetMulti<NoteEntity>> {
    const limitNum = Number(queries.limit) || 20;
    const pageNum = Number(queries.page) || 1;
    const skip = limitNum * (pageNum - 1); // Corrected skip calculation
    const rangeFrom = queries.fromDate;
    const rangeTo = queries.toDate;

    // Fetch customer data from cache
    const key = createKeyCustomerActive(active.customerId);
    const customerActive = await this.cacheService.getCache<CustomerEntity>(key);

    if (!customerActive) {
      throw new BadRequestException('Customer not found or inactive');
    }

    try {
      const queryBuilder = this.noteRepository.createQueryBuilder('note');

      // Add customer ID filter
      queryBuilder.where('note.customerId = :customerId', { customerId: customerActive.id });

      // Add date range filter if provided
      if (rangeFrom) {
        queryBuilder.andWhere('note.createdAt >= :rangeFrom', { rangeFrom });
      }
      if (rangeTo) {
        queryBuilder.andWhere('note.createdAt <= :rangeTo', { rangeTo });
      }

      // Apply pagination
      queryBuilder.skip(skip).take(limitNum);

      // Execute query and return results
      const [items, totalItems] = await queryBuilder.getManyAndCount();

      return {
        items,
        totalItems,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to fetch notes: ${error.message}`);
    }
  }

  async findOneById(id: string) {
    const findItem = await this.noteRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Note'));
    }
    return findItem;
  }

  async update({ id, payload, active }: IUpdateService<UpdateNoteDto>): Promise<NoteEntity> {
    // check exist
    const findItem = await this.noteRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Note'));
    }

    //
    const key = createKeyCustomerActive(active.customerId);
    const customerActive = await this.cacheService.getCache<CustomerEntity>(key);

    //
    const newItem = await this.noteRepository.save({
      ...findItem,
      ...payload,
      customerId: customerActive,
      updatedBy: customerActive,
    });

    return newItem;
  }

  async remove(ids: string[], active: TPayloadToken): Promise<DeleteResult[]> {
    //
    const findItems = await this.noteRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Notes'));
    }

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.noteRepository.delete(id)));

    //
    return itemDeleted;
  }
}
