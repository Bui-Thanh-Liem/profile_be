import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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
import { SubjectGroupService } from '../subject-group/subject-group.service';
import { CreateSubjectItemDto } from './dto/create-subject-item.dto';
import { UpdateSubjectItemDto } from './dto/update-subject-item.dto';
import { SubjectItemEntity } from './entities/subject-item.entity';

@Injectable()
export class SubjectItemService {
  private readonly logger = new Logger(SubjectItemService.name);

  constructor(
    private userService: UserService,
    private keywordService: KeywordService,
    private fileLocalService: FileLocalService,

    @Inject(forwardRef(() => SubjectGroupService))
    private subjectGroupService: SubjectGroupService,

    @InjectRepository(SubjectItemEntity)
    private subjectItemRepository: Repository<SubjectItemEntity>,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateSubjectItemDto>) {
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
      const findItem = await this.subjectItemRepository.findOneBy({ name });
      if (findItem) {
        throw new ConflictException(Exception.exists('Name subject item'));
      }

      //
      let findKeywords: KeywordEntity[];
      if (keywords) {
        findKeywords = await this.keywordService.findManyByIds(keywords);
      }

      //
      const dataCreate = this.subjectItemRepository.create({
        ...payload,
        image: filename,
        keywords: findKeywords,
        createdBy: creator,
      });
      return await this.subjectItemRepository.save(dataCreate);
    } catch (error) {
      await this.fileLocalService.removeByFileNames([filename]);
      throw error;
    }
  }

  async update({
    id,
    payload,
    newImage,
    activeUser,
  }: IUpdateService<UpdateSubjectItemDto>): Promise<SubjectItemEntity> {
    const { keywords } = payload;
    const newFilename = newImage?.filename;

    try {
      const editor = await this.userService.findOneById(activeUser.userId);
      if (!editor) {
        throw new BadRequestException(Exception.bad());
      }

      // check exist
      const findItem = await this.subjectItemRepository.findOneBy({ id });
      if (!findItem) {
        throw new NotFoundException(Exception.notfound('Image subject item'));
      }

      // Kiểm tra nếu có image mới thì xóa cũ, gán mới cho cũ
      if (newFilename) {
        await this.fileLocalService.removeByFileNames([findItem.image]);
        payload.image = newFilename;
      }

      //
      const findKeywords = await this.keywordService.findManyByIds(keywords);

      //
      const newItem = await this.subjectItemRepository.save({
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

  async findAll({ queries }: IFindAllService<SubjectItemEntity>): Promise<IGetMulti<SubjectItemEntity>> {
    try {
      const queryBuilder = new UtilBuilder<SubjectItemEntity>(this.subjectItemRepository);
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

  async findManyByIds(ids: string[]): Promise<SubjectItemEntity[]> {
    //
    const findItems = await this.subjectItemRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Subject item'));
    }

    //
    return findItems;
  }

  async findOneById(id: string): Promise<SubjectItemEntity> {
    const findItem = await this.subjectItemRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Subject item'));
    }

    return findItem;
  }

  async remove(ids: string[]): Promise<DeleteResult[]> {
    //
    const findItems = await this.subjectItemRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Image subject item'));
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
    const itemDeleted = await Promise.all(ids.map((id) => this.subjectItemRepository.delete(id)));
    return itemDeleted;
  }
}
