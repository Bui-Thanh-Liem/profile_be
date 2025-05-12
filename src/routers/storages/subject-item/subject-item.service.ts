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
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserService } from 'src/routers/user/user.service';
import { UtilArray } from 'src/utils/Array.util';
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
    private handleLocalFileService: HandleLocalFileService,

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
      await this.handleLocalFileService.removeByFileNames([filename]);
      throw error;
    }
  }

  async update({
    id,
    payload,
    newImages,
    activeUser,
  }: IUpdateService<UpdateSubjectItemDto>): Promise<SubjectItemEntity> {
    const { image, keywords } = payload;
    const newFilenames = newImages?.map((img) => img?.filename) || [];
    console.log('newImages::', newImages);

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

      // Tìm oldFilenames đã xoá đi
      const otherArr = UtilArray.findItemNotOtherItem({
        thanArr: [findItem.image],
        lessArr: [image],
      });

      // Xoá oldFilenames đã tìm được
      if (otherArr.length) {
        await this.handleLocalFileService.removeByFileNames(otherArr);
      }

      // Đẩy newFilenames mới vào
      if (newFilenames.length > 0) {
        payload.image = newFilenames[0];
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
      await this.handleLocalFileService.removeByFileNames(newFilenames);
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
          this.handleLocalFileService.removeByFileNames([item.image]);
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
