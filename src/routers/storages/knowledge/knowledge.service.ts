import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserService } from 'src/routers/user/user.service';
import { UtilBuilder } from 'src/utils/Builder.util';
import { DeleteResult, In, Repository } from 'typeorm';
import { KeywordEntity } from '../keyword/entities/keyword.entity';
import { KeywordService } from '../keyword/keyword.service';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { KnowledgeEntity } from './entities/knowledge.entity';

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    private userService: UserService,
    private keywordService: KeywordService,
    private fileLocalService: FileLocalService,

    @InjectRepository(KnowledgeEntity)
    private knowledgeRepository: Repository<KnowledgeEntity>,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateKnowledgeDto>) {
    const { keywords, name } = payload;
    const filename = (payload.image as Express.Multer.File).filename;

    try {
      //
      const creator = await this.userService.findOneById(activeUser.userId);
      if (!creator) {
        this.logger.debug('Not found creator');
        throw new BadRequestException(Exception.bad());
      }

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
      return await this.knowledgeRepository.save(dataCreate);
    } catch (error) {
      await this.fileLocalService.removeByFileNames([filename]);
      throw error;
    }
  }

  async update({ id, payload, newImage, activeUser }: IUpdateService<UpdateKnowledgeDto>): Promise<KnowledgeEntity> {
    const { keywords } = payload;
    const newFilename = newImage?.filename;

    try {
      const editor = await this.userService.findOneById(activeUser.userId);
      if (!editor) {
        throw new BadRequestException(Exception.bad());
      }

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

      return newItem;
    } catch (error) {
      await this.fileLocalService.removeByFileNames([newFilename]);
    }
  }

  async findAll({ queries }: IFindAllService<KnowledgeEntity>): Promise<IGetMulti<KnowledgeEntity>> {
    try {
      const queryBuilder = new UtilBuilder<KnowledgeEntity>(this.knowledgeRepository);
      const { items, totalItems } = await queryBuilder.handleConditionQueries({
        queries,
        user: null,
        searchField: 'name',
      });

      return {
        items,
        totalItems,
      };
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

  async remove(ids: string[]): Promise<DeleteResult[]> {
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
          this.fileLocalService.removeByFileNames([item.image]);
        } catch (error) {
          console.error(`Failed to remove image:::`, error);
        }
      }),
    );

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.knowledgeRepository.delete(id)));
    return itemDeleted;
  }
}
