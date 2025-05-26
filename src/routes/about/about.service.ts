import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { ICreateService, IUpdateService } from 'src/interfaces/common.interface';
import Exception from 'src/message-validations/exception.validation';
import { isExitItem } from 'src/utils/isPredicates.util';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateAboutDto } from './dto/create-about.dto';
import { UpdateAboutDto } from './dto/update-about.dto';
import { AboutEntity } from './entities/about.entity';
import { aboutData } from './initial-data';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutEntity)
    private aboutRepository: Repository<AboutEntity>,
    private userService: UserService,
    private fileLocalService: FileLocalService,
  ) {
    this.create({ payload: aboutData, active: null });
  }

  async create({ payload }: ICreateService<CreateAboutDto>) {
    const findItem = await this.aboutRepository.find();
    if (findItem.length > 0) {
      return;
    }

    //
    const dataCreate = this.aboutRepository.create({
      ...payload,
    });
    const newItem = await this.aboutRepository.save(dataCreate);
    return newItem;
  }

  async update({
    id, // Bỏ, about chỉ có một
    payload,
    newImage,
    active,
  }: IUpdateService<UpdateAboutDto>): Promise<AboutEntity> {
    const newFilename = newImage?.filename;

    try {
      //
      const editor = await this.userService.findOneById(active.userId);
      if (!isExitItem(editor)) {
        throw new BadRequestException(Exception.bad());
      }

      //
      const findItems = await this.aboutRepository.find({
        relations: {
          updatedBy: true,
          createdBy: true,
        },
      }); // luôn luôn 1 item
      const findItem = findItems[0];

      // Kiểm tra nếu có image mới thì xóa cũ, gán mới cho cũ
      if (newFilename) {
        await this.fileLocalService.removeByFileNames([findItem.image]);
        payload.image = newFilename;
      }

      //
      const itemUpdated = await this.aboutRepository.save({
        ...findItem,
        ...payload,
        updatedBy: editor,
      });

      return itemUpdated;
    } catch (error) {
      await this.fileLocalService.removeByFileNames([newFilename]);
    }
  }

  async find(): Promise<AboutEntity> {
    const items = await this.aboutRepository.find({
      relations: {
        updatedBy: true,
        createdBy: true,
      },
    });

    return items[0];
  }
}
