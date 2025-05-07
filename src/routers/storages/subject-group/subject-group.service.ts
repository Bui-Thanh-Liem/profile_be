import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserService } from 'src/routers/user/user.service';
import { DeleteResult, In, Repository } from 'typeorm';
import { SubjectItemEntity } from '../subject-item/entities/subject-item.entity';
import { SubjectItemService } from '../subject-item/subject-item.service';
import { CreateSubjectGroupDto } from './dto/create-subject-group.dto';
import { UpdateSubjectGroupDto } from './dto/update-subject-group.dto';
import { SubjectGroupEntity } from './entities/subject-group.entity';

@Injectable()
export class SubjectGroupService {
  constructor(
    private userService: UserService,

    @Inject(forwardRef(() => SubjectItemService))
    private subjectItemService: SubjectItemService,

    @InjectRepository(SubjectGroupEntity)
    private subjectGroupRepository: Repository<SubjectGroupEntity>,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateSubjectGroupDto>) {
    const { name, subject, items } = payload;

    //
    const creator = await this.userService.findOneById(activeUser.userId);
    if (!creator) {
      throw new BadRequestException(Exception.bad());
    }

    //
    const findItem = await this.subjectGroupRepository.findOneBy({ name });
    if (findItem) {
      throw new ConflictException(Exception.exists('Subject name'));
    }

    //
    let findItems: SubjectItemEntity[];
    if (items) {
      findItems = await this.subjectItemService.findManyByIds(items);
    }

    //
    const dataCreate = this.subjectGroupRepository.create({
      ...payload,
      items: findItems,
      createdBy: creator,
    });
    const newItem = await this.subjectGroupRepository.save(dataCreate);
    return newItem;
  }

  async update({
    id,
    payload,
    newImages,
    activeUser,
  }: IUpdateService<UpdateSubjectGroupDto>): Promise<SubjectGroupEntity> {
    const { name, subject, items } = payload;

    //
    const editor = await this.userService.findOneById(activeUser.userId);
    if (!editor) {
      throw new BadRequestException(Exception.bad());
    }

    // check exist
    const findItem = await this.subjectGroupRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Subject'));
    }

    // check exist name
    const findItemByName = await this.subjectGroupRepository.findOneBy({
      name,
    });
    if (!findItemByName) {
      throw new NotFoundException(Exception.exists('Subject name'));
    }

    //
    let findItems: SubjectItemEntity[];
    if (items) {
      findItems = await this.subjectItemService.findManyByIds(items);
    }

    //
    const newItem = await this.subjectGroupRepository.save({
      ...findItem,
      ...payload,
      items: findItems,
      updatedBy: editor,
    });

    return newItem;
  }

  async findAll(): Promise<IGetMulti<SubjectGroupEntity>> {
    const [items, totalItems] = await this.subjectGroupRepository.findAndCount({
      relations: {
        createdBy: true,
        updatedBy: true,
      },
    });

    return {
      items,
      totalItems,
    };
  }

  async findManyByIds(ids: string[]): Promise<SubjectGroupEntity[]> {
    //
    const findItems = await this.subjectGroupRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Subject group'));
    }

    //
    return findItems;
  }

  async findOneById(id: string) {
    const findItem = await this.subjectGroupRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Subject group'));
    }
    return findItem;
  }

  async remove(ids: string[]): Promise<DeleteResult[]> {
    //
    const findItems = await this.subjectGroupRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Subject group'));
    }

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.subjectGroupRepository.delete(id)));

    return itemDeleted;
  }
}
