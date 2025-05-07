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
import { ICreateService } from 'src/interfaces/common.interface';
import Exception from 'src/message-validations/exception.validation';
import { UserService } from 'src/routers/user/user.service';
import { In, Repository } from 'typeorm';
import { KeywordEntity } from '../keyword/entities/keyword.entity';
import { KeywordService } from '../keyword/keyword.service';
import { SubjectGroupEntity } from '../subject-group/entities/subject-group.entity';
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
    console.log('service payload:::', payload);

    const { keywords, name, groups } = payload;
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
      let findGroups: SubjectGroupEntity[];
      if (keywords) {
        findGroups = await this.subjectGroupService.findManyByIds(groups);
      }

      //
      const dataCreate = this.subjectItemRepository.create({
        ...payload,
        image: filename,
        groups: findGroups,
        keywords: findKeywords,
        createdBy: creator,
      });
      return await this.subjectItemRepository.save(dataCreate);
    } catch (error) {
      await this.handleLocalFileService.removeByFileNames([filename]);
      throw error;
    }
  }

  findAll() {
    return `This action returns all subjectItem`;
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

  findOne(id: number) {
    return `This action returns a #${id} subjectItem`;
  }

  update(id: number, updateSubjectItemDto: UpdateSubjectItemDto) {
    return `This action updates a #${id} subjectItem`;
  }

  remove(id: number) {
    return `This action removes a #${id} subjectItem`;
  }
}
