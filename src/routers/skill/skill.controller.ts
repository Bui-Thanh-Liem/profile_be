import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, UploadedFile } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';

@Controller(Constants.CONSTANT_ROUTE.SKILL)
export class SkillController {
  private readonly logger = new Logger(SkillController.name);
  constructor(private readonly skillService: SkillService) {}

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
    //
    const result = await this.skillService.update({
      id,
      newImage,
      activeUser,
      payload: { ...payload },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll() {
    // eslint-disable-next-line prefer-const
    const result = await this.skillService.findAll();
    return new ResponseSuccess('Success', result);
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
