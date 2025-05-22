import { ConflictException, Injectable, Logger, NotFoundException, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { ICreateService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { DeleteResult, In, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
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
    private userService: UserService,
    private fileLocalService: FileLocalService,
  ) {}
  onApplicationBootstrap() {
    setTimeout(() => {
      this.initialData();
    }, 1000);
  }

  async create({ payload, activeUser }: ICreateService<CreateSkillDto>): Promise<SkillEntity> {
    const filename = (payload.image as Express.Multer.File).filename;

    try {
      const creator = await this.userService.verifyUser(activeUser.userId);

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

  async findAll(): Promise<IGetMulti<SkillEntity>> {
    const [items, totalItems] = await this.skillRepository.findAndCount({
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

  async findOneById(id: string) {
    const findItem = await this.skillRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Skill'));
    }
    return findItem;
  }

  async update({ id, payload, newImage, activeUser }: IUpdateService<UpdateSkillDto>): Promise<SkillEntity> {
    const newFilename = newImage?.filename;

    try {
      //
      const editor = await this.userService.verifyUser(activeUser.userId);

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
    const creator = await this.userService.findOneByEmail(process.env.ROOT_EMAIL);
    if (!creator) return;

    //
    await Promise.all(
      skillData.map((skill) => {
        return this.skillRepository.save(this.skillRepository.create({ ...skill, createdBy: creator }));
      }),
    );
  }
}
