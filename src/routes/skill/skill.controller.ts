import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { SkillService } from './skill.service';
import AQueries from 'src/abstracts/AQuery.abstract';
import { SkillEntity } from './entities/skill.entity';

@Controller(Constants.CONSTANT_ROUTE.SKILL)
export class SkillController {
  constructor(private readonly skillService: SkillService) {}

  @Roles({ resource: 'skill', action: 'create' })
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
    @ActiveUser() active: TPayloadToken,
    @Body() payload: CreateSkillDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const result = await this.skillService.create({
      payload: { ...payload, image },
      active,
    });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'skill', action: 'update' })
  @Patch(':id')
  @UploadSingleFile()
  async update(
    @ActiveUser() active: TPayloadToken,
    @Param('id') id: string,
    @Body() payload: UpdateSkillDto,
    @UploadedFile() newImage: Express.Multer.File,
  ) {
    //
    const result = await this.skillService.update({
      id,
      newImage,
      active,
      payload: { ...payload },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll(@Query() queries: AQueries<SkillEntity>) {
    const result = await this.skillService.findAll({ queries });
    return new ResponseSuccess('Success', result);
  }

  @Get(':id')
  @Public()
  async findOneById(@Param('id') id: string) {
    const result = await this.skillService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'skill', action: 'delete' })
  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.skillService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
