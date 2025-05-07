import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Req, UploadedFile } from '@nestjs/common';
import { Request } from 'express';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { Public } from 'src/decorators/public.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { HandleLocalFileService } from 'src/helpers/services/HandleLocalFile.service';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { ActiveUser } from 'src/decorators/activeUser.decorator';

@Controller(Constants.CONSTANT_ROUTE.SKILL)
export class SkillController {
  private readonly logger = new Logger(SkillController.name);

  constructor(
    private readonly skillService: SkillService,
    private handleLocalFileService: HandleLocalFileService,
  ) {}

  @Post()
  @UploadSingleFile({
    name: {
      type: 'string',
      required: ['name is required'],
    },
    progress: {
      type: 'number',
    },
  })
  async create(
    @ActiveUser() activeUser: TPayloadToken,
    @Body() payload: CreateSkillDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const result = await this.skillService.create({
      payload: { ...payload, image },
      activeUser,
    });
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  @UploadSingleFile()
  async update(
    @ActiveUser() activeUser: TPayloadToken,
    @Param('id') id: string,
    @Body() payload: UpdateSkillDto,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    // Nếu images từ client gửi lên có 1 item append thì sẽ có dạng string -> [string]
    let oldImage = UtilConvert.convertStringToArray(payload.image);
    oldImage = this.handleLocalFileService.setFileUrlForServer(oldImage);

    //
    const result = await this.skillService.update({
      id,
      newImage,
      activeUser,
      payload: { ...payload, image: oldImage[0] },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll() {
    // eslint-disable-next-line prefer-const
    let { items, totalItems } = await this.skillService.findAll();

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
  async findOneById(@Param('id') id: string) {
    const result = await this.skillService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.skillService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
