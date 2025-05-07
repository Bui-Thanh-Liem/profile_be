import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { Constants, Enums } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { CreateKeyWordDto } from './dto/create-keyword.dto';
import { UpdateKeyWordDto } from './dto/update-keyword.dto';
import { KeywordService } from './keyword.service';
import { IKeyWord } from 'src/interfaces/models.interface';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Public } from 'src/decorators/public.decorator';

@Controller(Constants.CONSTANT_ROUTE.KEYWORD)
export class KeyWordController {
  private readonly logger = new Logger(KeyWordController.name);
  constructor(private readonly keywordService: KeywordService) {}

  @Post()
  async create(@Body() payload: CreateKeyWordDto, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.keywordService.create({
      payload,
      activeUser,
    });
    return new ResponseSuccess('Success', result);
  }

  @Public()
  @Get()
  async findAll(@Query() queries: AQueries<IKeyWord>) {
    this.logger.debug(`Queries ::: ${JSON.stringify(queries)}`);
    const result = await this.keywordService.findAll({
      queries,
    });
    return new ResponseSuccess('Success', result);
  }

  @Public()
  @Get('type/:type')
  async findAllByTypeSubject(@Param('type') type: Enums.ETypeSubject) {
    this.logger.debug(`findAllByTypeSubject ::: ${JSON.stringify(type)}`);
    const result = await this.keywordService.findAllByTypeSubject({ type });
    return new ResponseSuccess('Success', result);
  }

  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.keywordService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateKeyWordDto, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.keywordService.update({
      id,
      payload,
      activeUser,
    });
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.keywordService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
