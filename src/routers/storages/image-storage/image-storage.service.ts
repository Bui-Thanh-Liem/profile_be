import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import { UtilArray } from 'src/utils/Array.util';
import Exception from 'src/message-validations/exception.validation';
import { DeleteResult, In, Repository } from 'typeorm';
import { KeywordEntity } from '../keyword/entities/keyword.entity';
import { KeywordService } from '../keyword/keyword.service';
import { UserService } from '../../user/user.service';
import { CreateImageStorageDto } from './dto/create-image-storage.dto';
import { UpdateImageStorageDto } from './dto/update-image-storage.dto';
import { ImageStorageEntity } from './entities/image-storage.entity';
import { UtilBuilder } from 'src/utils/Builder.util';

@Injectable()
export class ImageStorageService {
  constructor(
    @InjectRepository(ImageStorageEntity)
    private imageStorageRepository: Repository<ImageStorageEntity>,
    private userService: UserService,
    private handleLocalFileService: HandleLocalFileService,
    private keywordService: KeywordService,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateImageStorageDto>): Promise<ImageStorageEntity> {
    const { keywords, label } = payload;
    const images = payload.images as Express.Multer.File[];
    const filenames = images?.map((img) => img.filename);

    try {
      //
      const creator = await this.userService.findOneById(activeUser.userId);
      if (!creator) {
        throw new BadRequestException(Exception.bad());
      }

      //
      const findItem = await this.imageStorageRepository.findOneBy({ label });
      if (findItem) {
        throw new ConflictException(Exception.exists('Label image storage'));
      }

      //
      let findKeywords: KeywordEntity[];
      if (keywords) {
        findKeywords = await this.keywordService.findManyByIds(keywords);
      }

      //
      const dataCreate = this.imageStorageRepository.create({
        ...payload,
        images: filenames,
        keywords: findKeywords,
        createdBy: creator,
      });
      const newItem = await this.imageStorageRepository.save(dataCreate);

      return newItem;
    } catch (error) {
      await this.handleLocalFileService.removeByFileNames(filenames);
      throw error;
    }
  }

  async update({
    id,
    payload,
    newImages,
    activeUser,
  }: IUpdateService<UpdateImageStorageDto>): Promise<ImageStorageEntity> {
    const { images, keywords } = payload;
    const newFilenames = newImages?.map((img) => img.filename) || [];

    try {
      const editor = await this.userService.findOneById(activeUser.userId);
      if (!editor) {
        throw new BadRequestException(Exception.bad());
      }

      // check exist
      const findItem = await this.imageStorageRepository.findOneBy({ id });
      if (!findItem) {
        throw new NotFoundException(Exception.notfound('Image storage'));
      }

      // Tìm oldFilenames đã xoá đi
      const otherArr = UtilArray.findItemNotOtherItem({
        thanArr: findItem.images,
        lessArr: images,
      });

      // Xoá oldFilenames đã tìm được
      if (otherArr.length) {
        await this.handleLocalFileService.removeByFileNames(otherArr);
      }

      // Đẩy newFilenames mới vào
      payload.images = [...payload.images, ...newFilenames];

      //
      const findKeywords = await this.keywordService.findManyByIds(keywords);

      //
      const newItem = await this.imageStorageRepository.save({
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

  async findAll({ queries }: IFindAllService<ImageStorageEntity>): Promise<IGetMulti<ImageStorageEntity>> {
    try {
      //
      const queryBuilder = new UtilBuilder<ImageStorageEntity>(this.imageStorageRepository);
      const { items, totalItems } = await queryBuilder.handleConditionQueries({
        queries,
        user: null,
        searchField: 'label',
      });

      return {
        items,
        totalItems,
      };
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async findOneById(id: string): Promise<ImageStorageEntity> {
    const findItem = await this.imageStorageRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Image storage'));
    }

    return findItem;
  }

  async remove(ids: string[]): Promise<DeleteResult[]> {
    //
    const findItems = await this.imageStorageRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Image storage'));
    }

    //
    await Promise.all(
      findItems?.map((item) => {
        try {
          this.handleLocalFileService.removeByFileNames(item.images);
        } catch (error) {
          console.error(`Failed to remove images:::`, error);
        }
      }),
    );

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.imageStorageRepository.delete(id)));

    return itemDeleted;
  }
}
