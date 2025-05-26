import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/helpers/services/Cache.service';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UtilBuilder } from 'src/utils/Builder.util';
import { createKeyUserActive } from 'src/utils/createKeyCache';
import { DeleteResult, In, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillEntity } from './entities/skill.entity';
import { skillData } from './initial-data';

@Injectable()
export class SkillService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SkillService.name);

  constructor(
    @InjectRepository(SkillEntity)
    private skillRepository: Repository<SkillEntity>,
    private fileLocalService: FileLocalService,
    private cacheService: CacheService,
  ) {}

  onApplicationBootstrap() {
    setTimeout(() => {
      this.initialData();
    }, 1000);
  }

  async create({ payload, active }: ICreateService<CreateSkillDto>): Promise<SkillEntity> {
    const filename = (payload.image as Express.Multer.File).filename;

    try {
      //
      const key = createKeyUserActive(active.userId);
      const creator = await this.cacheService.getCache<UserEntity>(key);

      //
      const findItem = await this.skillRepository.findOneBy({
        name: payload.name,
      });
      if (findItem) {
        throw new ConflictException(Exception.exists('Skill name'));
      }

      //
      const dataCreate = this.skillRepository.create({
        ...payload,
        image: filename,
        createdBy: creator,
      });
      return await this.skillRepository.save(dataCreate);
    } catch (error) {
      await this.fileLocalService.removeByFileNames([filename]);
      throw error;
    }
  }

  async findAll({ queries }: IFindAllService<SkillEntity>): Promise<IGetMulti<SkillEntity>> {
    try {
      const queryBuilder = new UtilBuilder<SkillEntity>(this.skillRepository);
      const results = await queryBuilder.handleConditionQueries({
        queries,
        user: null,
        searchField: 'name',
      });
      return results;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOneById(id: string) {
    const findItem = await this.skillRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Skill'));
    }
    return findItem;
  }

  async update({ id, payload, newImage, active }: IUpdateService<UpdateSkillDto>): Promise<SkillEntity> {
    const newFilename = newImage?.filename;

    try {
      //
      const key = createKeyUserActive(active.userId);
      const editor = await this.cacheService.getCache<UserEntity>(key);

      // check exist
      const findItem = await this.skillRepository.findOneBy({ id });
      if (!findItem) {
        throw new NotFoundException(Exception.notfound('Skill'));
      }

      // Kiểm tra nếu có image mới thì xóa cũ, gán mới cho cũ
      if (newFilename) {
        await this.fileLocalService.removeByFileNames([findItem.image]);
        payload.image = newFilename;
      }

      //
      const itemUpdated = await this.skillRepository.save({
        ...findItem,
        ...payload,
        updatedBy: editor,
      });

      return itemUpdated;
    } catch (error) {
      await this.fileLocalService.removeByFileNames([newFilename]);
      throw error;
    }
  }

  async remove(ids: string[]): Promise<DeleteResult[]> {
    //
    const findItems = await this.skillRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Skill'));
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
    const itemDeleted = await Promise.all(ids.map((id) => this.skillRepository.delete(id)));

    return itemDeleted;
  }

  async initialData() {
    //
    const findItems = await this.skillRepository.find();
    if (findItems.length > 0) return;

    //
    await Promise.all(
      skillData.map((skill) => {
        return this.skillRepository.save(this.skillRepository.create({ ...skill }));
      }),
    );
  }
}
