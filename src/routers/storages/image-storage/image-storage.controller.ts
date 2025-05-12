import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UploadedFiles } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UploadMultipleFiles } from 'src/decorators/upload-multi-file.decorator';
import { FileLocalService } from 'src/helpers/services/FileLocal.service';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateImageStorageDto } from './dto/create-image-storage.dto';
import { UpdateImageStorageDto } from './dto/update-image-storage.dto';
import { ImageStorageEntity } from './entities/image-storage.entity';
import { ImageStorageService } from './image-storage.service';

@Controller(Constants.CONSTANT_ROUTE.IMAGE_STORAGE)
export class ImageStorageController {
  private readonly logger = new Logger(ImageStorageController.name);

  constructor(
    private readonly imageStorageService: ImageStorageService,
    private fileLocalService: FileLocalService,
  ) {}

  @Post()
  @UploadMultipleFiles({
    label: { type: 'string', required: ['label is required'] },
    desc: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' }, required: ['keywords is required'] },
  })
  async create(
    @ActiveUser() activeUser: TPayloadToken,
    @Body() payload: CreateImageStorageDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    //
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    const result = await this.imageStorageService.create({
      payload: { ...payload, images, keywords: keywords },
      activeUser,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  @UploadMultipleFiles() // Nếu cập nhật file thì lưu file trước rồi kiểm tra nếu type !== 'string' thì ....
  async update(
    @Param('id') id: string,
    @ActiveUser() activeUser: TPayloadToken,
    @Body() payload: UpdateImageStorageDto,
    @UploadedFiles() images: Express.Multer.File[],
  ) {
    // Nếu images từ client gửi lên có 1 item append thì sẽ có dạng string -> [string]
    const oldImages = UtilConvert.convertStringToArray(payload.images);

    //
    console.log('payload.keywords', payload.keywords);
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    //
    const result = await this.imageStorageService.update({
      id,
      newImages: images,
      activeUser,
      payload: { ...payload, keywords: keywords, images: oldImages },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public() // Public thì không có activeUser (guard không xác thực)
  async findAll(@Query() queries: AQueries<ImageStorageEntity>) {
    this.logger.debug(`Queries ::: ${JSON.stringify(queries)}`);

    // eslint-disable-next-line prefer-const
    let { items, totalItems } = await this.imageStorageService.findAll({
      queries,
    });

    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.imageStorageService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.imageStorageService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
