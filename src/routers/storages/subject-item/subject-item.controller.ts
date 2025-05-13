import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UploadedFile } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateSubjectItemDto } from './dto/create-subject-item.dto';
import { UpdateSubjectItemDto } from './dto/update-subject-item.dto';
import { SubjectItemEntity } from './entities/subject-item.entity';
import { SubjectItemService } from './subject-item.service';

@Controller(Constants.CONSTANT_ROUTE.SUBJECT_ITEM)
export class SubjectItemController {
  private readonly logger = new Logger(SubjectItemController.name);
  constructor(private readonly subjectItemService: SubjectItemService) {}

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
    //
    console.log('payload.keywords', payload.keywords);
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    //
    const result = await this.subjectItemService.update({
      id,
      newImage: image,
      activeUser,
      payload: { ...payload, keywords: keywords },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll(@Query() queries: AQueries<SubjectItemEntity>) {
    console.log('queries:::', queries);

    const results = await this.subjectItemService.findAll({
      queries,
    });

    return new ResponseSuccess('Success', results);
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
