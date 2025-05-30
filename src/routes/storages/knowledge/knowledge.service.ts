import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/helpers/services/Cache.service';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilBuilder } from 'src/utils/Builder.util';
import { createKeyCustomerActive, createKeyUserActive } from 'src/utils/createKeyCache';
import { DeleteResult, In, Repository } from 'typeorm';
import { KeywordEntity } from '../keyword/entities/keyword.entity';
import { KeywordService } from '../keyword/keyword.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { KnowledgeEntity } from './entities/knowledge.entity';
import { CustomerEntity } from 'src/routes/customer/entities/customer.entity';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private keywordService: KeywordService,
    private fileLocalService: FileLocalService,
    private cacheService: CacheService,

    @InjectRepository(KnowledgeEntity)
    private knowledgeRepository: Repository<KnowledgeEntity>,
  ) {}

  async create({ payload, active }: ICreateService<CreateKnowledgeDto>) {
    const { keywords, name } = payload;
    const filename = (payload.image as Express.Multer.File).filename;

    try {
      //
      const key = createKeyUserActive(active.userId);
      const creator = await this.cacheService.getCache<UserEntity>(key);

      //
      const findItem = await this.knowledgeRepository.findOneBy({ name });
      if (findItem) {
        throw new ConflictException(Exception.exists('Name knowledge'));
      }

      //
      let findKeywords: KeywordEntity[];
      if (keywords) {
        findKeywords = await this.keywordService.findManyByIds(keywords);
      }

      //
      const dataCreate = this.knowledgeRepository.create({
        ...payload,
        image: filename,
        keywords: findKeywords,
        createdBy: creator,
      });

      //
      // try {
      //   await this.cacheService.deleteCacheByPattern(`knowledge:all:user-${activeUser.userId}`);
      // } catch (error) {
      //   throw new BadRequestException('Error deleting cache');
      // }

      return await this.knowledgeRepository.save(dataCreate);
    } catch (error) {
      await this.fileLocalService.removeByFileNames([filename]);
      throw error;
    }
  }

  async update({ id, payload, newImage, active }: IUpdateService<UpdateKnowledgeDto>): Promise<KnowledgeEntity> {
    const { keywords } = payload;
    const newFilename = newImage?.filename;

    try {
      //
      const key = createKeyUserActive(active.userId);
      const editor = await this.cacheService.getCache<UserEntity>(key);

      // check exist
      const findItem = await this.knowledgeRepository.findOneBy({ id });
      if (!findItem) {
        throw new NotFoundException(Exception.notfound('Image knowledge'));
      }

      // Kiểm tra nếu có image mới thì xóa cũ, gán mới cho cũ
      if (newFilename) {
        await this.fileLocalService.removeByFileNames([findItem.image]);
        payload.image = newFilename;
      }

      //
      const findKeywords = await this.keywordService.findManyByIds(keywords);

      //
      const newItem = await this.knowledgeRepository.save({
        ...findItem,
        ...payload,
        keywords: findKeywords,
        updatedBy: editor,
      });

      //
      // try {
      //   await this.cacheService.deleteCacheByPattern(`knowledge:all:user-${activeUser.userId}`);
      // } catch (error) {
      //   throw new BadRequestException('Error deleting cache');
      // }

      return newItem;
    } catch (error) {
      await this.fileLocalService.removeByFileNames([newFilename]);
    }
  }

  async findAll({ queries }: IFindAllService<KnowledgeEntity>): Promise<IGetMulti<KnowledgeEntity>> {
    try {
      // const cacheKey = `knowledge:all:user-${activeUser.userId}:page-${queries.page}:limit-${queries.limit}`;
      // const dataInCache = await this.cacheService.getCache<IGetMulti<KnowledgeEntity>>(cacheKey);
      // if (dataInCache) return dataInCache;

      const queryBuilder = new UtilBuilder<KnowledgeEntity>(this.knowledgeRepository);
      const results = await queryBuilder.handleConditionQueries({
        queries,
        user: null,
        searchField: 'name',
      });

      //
      // await this.cacheService.setCache(cacheKey, results, 180);
      // await this.cacheService.addToKeyList(`knowledge:all:user-${activeUser.userId}`, cacheKey, 240);

      return results;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findManyByIds(ids: string[]): Promise<KnowledgeEntity[]> {
    //
    const findItems = await this.knowledgeRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Knowledge'));
    }

    //
    return findItems;
  }

  async findOneById(id: string): Promise<KnowledgeEntity> {
    const findItem = await this.knowledgeRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Knowledge'));
    }

    return findItem;
  }

  async remove(ids: string[], active: TPayloadToken): Promise<DeleteResult[]> {
    //
    const findItems = await this.knowledgeRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Image knowledge'));
    }

    //
    await Promise.all(
      findItems?.map((item) => {
        try {
          //
          this.fileLocalService.removeByFileNames([item.image]);
        } catch (error) {
          console.error(`Failed to remove image:::`, error);
        }
      }),
    );

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.knowledgeRepository.delete(id)));

    //
    // try {
    //   await this.cacheService.deleteCacheByPattern(`knowledge:all:user-${activeUser.userId}`);
    // } catch (error) {
    //   throw new BadRequestException('Error deleting cache');
    // }

    //
    return itemDeleted;
  }

  async toggleLike(
    knowledgeId: string,
    customerId: string,
  ): Promise<{ action: 'liked' | 'unliked'; knowledge: KnowledgeEntity }> {
    //""
    const knowledge = await this.knowledgeRepository.findOne({
      where: { id: knowledgeId },
      relations: ['likes'],
    });
    if (!knowledge) {
      throw new NotFoundException(Exception.notfound('Knowledge'));
    }

    //
    const key = createKeyCustomerActive(customerId);
    const customerActive = await this.cacheService.getCache<CustomerEntity>(key);
    console.log('customerActive:::', customerActive);

    const hasLiked = knowledge.likes?.some((u) => u.id === customerId);
    knowledge.likes = knowledge.likes || [];

    if (hasLiked) {
      // Unlike: Remove user from likes
      knowledge.likes = knowledge.likes.filter((u) => u.id !== customerId);
      knowledge.likeCount = Math.max(0, knowledge.likeCount - 1);
    } else {
      // Like: Add user to likes
      knowledge.likes.push(customerActive);
      knowledge.likeCount = (knowledge.likeCount || 0) + 1;
    }

    try {
      await this.knowledgeRepository.save(knowledge);
      return {
        action: hasLiked ? 'unliked' : 'liked',
        knowledge,
      };
    } catch (error) {
      throw new InternalServerErrorException(`Could not ${hasLiked ? 'remove' : 'add'} like, please try again later.`);
    }
  }
}
