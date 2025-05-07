import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Req, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateSubjectItemDto } from './dto/create-subject-item.dto';
import { UpdateSubjectItemDto } from './dto/update-subject-item.dto';
import { SubjectItemService } from './subject-item.service';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { ActiveUser } from 'src/decorators/activeUser.decorator';

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
    content: { type: 'string', required: ['content is required'] },
    keywords: { type: 'array', items: { type: 'string' }, required: ['keywords is required'] },
    groups: { type: 'array', items: { type: 'string' } },
  })
  async create(
    @ActiveUser() activeUser: TPayloadToken,
    @UploadedFile() image: Express.Multer.File,
    @Body() payload: CreateSubjectItemDto,
  ) {
    console.log('payload:::', payload);
    console.log('image:::', image);

    //
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    //
    const groups = UtilConvert.convertStringToArrayBySplit(payload.groups as any, ',');

    const result = await this.subjectItemService.create({
      payload: { ...payload, image, keywords, groups },
      activeUser,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  findAll() {
    return this.subjectItemService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subjectItemService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubjectItemDto: UpdateSubjectItemDto) {
    return this.subjectItemService.update(+id, updateSubjectItemDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subjectItemService.remove(+id);
  }
}
