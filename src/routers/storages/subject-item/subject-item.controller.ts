import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UploadMultipleFiles } from 'src/decorators/upload-multi-file.decorator';
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateSubjectItemDto } from './dto/create-subject-item.dto';
import { UpdateSubjectItemDto } from './dto/update-subject-item.dto';
import { SubjectItemEntity } from './entities/subject-item.entity';
import { SubjectItemService } from './subject-item.service';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';

@Controller(Constants.CONSTANT_ROUTE.SUBJECT_ITEM)
export class SubjectItemController {
  private readonly logger = new Logger(SubjectItemController.name);
  constructor(
    private readonly subjectItemService: SubjectItemService,
    private handleLocalFileService: HandleLocalFileService,
  ) {}

  @Post()
  @UploadSingleFile({
    name: { type: 'string', required: ['name is required'] },
    desc: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' }, required: ['keywords is required'] },
  })
  async create(
    @ActiveUser() activeUser: TPayloadToken,
    @UploadedFile() image: Express.Multer.File,
    @Body() payload: CreateSubjectItemDto,
  ) {
    //
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    const result = await this.subjectItemService.create({
      payload: { ...payload, image, keywords },
      activeUser,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  @UploadSingleFile()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateSubjectItemDto,
    @ActiveUser() activeUser: TPayloadToken,
    @UploadedFile() image: Express.Multer.File,
  ) {
    // Nếu images từ client gửi lên có 1 item append thì sẽ có dạng string -> [string]
    let oldImages = UtilConvert.convertStringToArray([payload.image]);
    oldImages = this.handleLocalFileService.setFileUrlForServer(oldImages);

    //
    console.log('payload.keywords', payload.keywords);
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    //
    const result = await this.subjectItemService.update({
      id,
      newImages: [image],
      activeUser,
      payload: { ...payload, keywords: keywords, image: oldImages[0] },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll(@Query() queries: AQueries<SubjectItemEntity>) {
    // eslint-disable-next-line prefer-const
    let { items, totalItems } = await this.subjectItemService.findAll({
      queries,
    });

    //  Thêm tiền tố cho url ảnh
    items = items?.map((item) => {
      const image = this.handleLocalFileService.setFileUrlForClient(item.image);
      return {
        ...item,
        image,
      };
    });

    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.subjectItemService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.subjectItemService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
