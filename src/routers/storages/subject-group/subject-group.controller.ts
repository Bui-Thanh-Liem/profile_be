import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateSubjectGroupDto } from './dto/create-subject-group.dto';
import { UpdateSubjectGroupDto } from './dto/update-subject-group.dto';
import { SubjectGroupService } from './subject-group.service';

@Controller(Constants.CONSTANT_ROUTE.SUBJECT_GROUP)
export class SubjectGroupController {
  private readonly logger = new Logger(SubjectGroupController.name);
  constructor(private readonly subjectGroupService: SubjectGroupService) {}

  @Post()
  async create(@ActiveUser() activeUser: TPayloadToken, @Body() payload: CreateSubjectGroupDto) {
    const result = await this.subjectGroupService.create({
      payload,
      activeUser,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Get()
  @Public()
  async findAll() {
    const { items, totalItems } = await this.subjectGroupService.findAll();
    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.subjectGroupService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  async update(
    @ActiveUser() activeUser: TPayloadToken,
    @Param('id') id: string,
    @Body() payload: UpdateSubjectGroupDto,
  ) {
    //
    const result = await this.subjectGroupService.update({
      id,
      payload,
      activeUser,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.subjectGroupService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
