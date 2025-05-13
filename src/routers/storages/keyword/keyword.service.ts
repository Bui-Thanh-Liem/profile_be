import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enums } from 'liemdev-profile-lib';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserService } from 'src/routers/user/user.service';
import { UtilBuilder } from 'src/utils/Builder.util';
import { In, Not, Repository } from 'typeorm';
import { CreateKeyWordDto } from './dto/create-keyword.dto';
import { UpdateKeyWordDto } from './dto/update-keyword.dto';
import { KeywordEntity } from './entities/keyword.entity';

@Injectable()
export class KeywordService {
  private readonly logger = new Logger(KeywordService.name);
  private QueryBuilder: UtilBuilder<KeywordEntity>;

  constructor(
    @InjectRepository(KeywordEntity)
    private keywordRepository: Repository<KeywordEntity>,
    private userService: UserService,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateKeyWordDto>): Promise<KeywordEntity> {
    //
    const creator = await this.userService.findOneById(activeUser.userId);
    if (!creator) {
      throw new BadRequestException(Exception.bad());
    }

    // Check exist name
    const findItemByName = await this.keywordRepository.findOneBy({
      name: payload.name,
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Keyword'));
    }

    //
    const dataCreate = this.keywordRepository.create({
      ...payload,
      createdBy: creator,
    });
    const newItem = await this.keywordRepository.save(dataCreate);

    return newItem;
  }

  async findAll({ queries }: IFindAllService<KeywordEntity>): Promise<IGetMulti<KeywordEntity>> {
    //
    this.QueryBuilder = new UtilBuilder<KeywordEntity>(this.keywordRepository);
    const { items, totalItems } = await this.QueryBuilder.handleConditionQueries({
      queries,
      user: null,
      searchField: 'name',
    });

    return {
      items,
      totalItems,
    };
  }

  async findAllByTypeSubject({ type }: { type: Enums.ETypeSubject }): Promise<IGetMulti<KeywordEntity>> {
    //
    const items = await this.keywordRepository
      .createQueryBuilder('keyword')
      .leftJoin('keyword.subjectItems', 'subjectItem') // 👈 alias đúng là 'subjectItem'
      .where('subjectItem.type = :type', { type: type })
      .getMany();
    const totalItems = await this.keywordRepository.count();

    return {
      items,
      totalItems,
    };
  }

  async findOneById(id: string): Promise<KeywordEntity> {
    const findItem = await this.keywordRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Keyword'));
    }
    return findItem;
  }

  async findManyByIds(ids: string[]): Promise<KeywordEntity[]> {
    //
    const findItems = await this.keywordRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Keyword'));
    }

    //
    return findItems;
  }

  async update({ id, payload, activeUser }: IUpdateService<UpdateKeyWordDto>): Promise<KeywordEntity> {
    //
    const editor = await this.userService.findOneById(activeUser.userId);
    if (!editor) {
      throw new BadRequestException(Exception.bad());
    }

    // check exist
    const findItem = await this.keywordRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('role'));
    }

    // Check exist name
    const findItemByName = await this.keywordRepository.findOne({
      where: {
        name: payload.name,
        id: Not(id),
      },
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Keyword'));
    }

    //
    const itemUpdated = await this.keywordRepository.save({
      ...findItem,
      ...payload,
      updatedBy: editor,
    });

    return itemUpdated;
  }

  async remove(ids: string[]): Promise<boolean> {
    //
    const items = await this.keywordRepository
      .createQueryBuilder('keyword')
      .leftJoinAndSelect('keyword.subjectItems', 'subjectItems')
      .getMany();

    //
    if (items.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Keyword to delete'));
    }

    // Depends
    await Promise.allSettled(
      items.map((item) => {
        this.checkRelations(item, ['subjectItems']); // Check exist relations
        return this.keywordRepository.delete(item.id);
      }),
    );

    return true;
  }

  checkRelations(item: KeywordEntity, keyRelations: (keyof KeywordEntity)[]) {
    for (const key of keyRelations) {
      const relation = item[key];

      if (Array.isArray(relation) && relation.length > 0) {
        throw new UnprocessableEntityException(Exception.depend());
      }
    }
  }
}
