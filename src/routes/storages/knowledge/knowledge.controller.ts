import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UploadedFile } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveCustomer } from 'src/decorators/activeCustomer.decorator';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Customer } from 'src/decorators/customer.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { UploadSingleFile } from 'src/decorators/upload-single-file.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { UtilConvert } from 'src/utils/Convert.util';
import { CreateKnowledgeDto } from './dto/create-knowledge.dto';
import { UpdateKnowledgeDto } from './dto/update-knowledge.dto';
import { KnowledgeEntity } from './entities/knowledge.entity';
import { KnowledgeService } from './knowledge.service';

@Controller(Constants.CONSTANT_ROUTE.KNOWLEDGE)
export class KnowledgeController {
  private readonly logger = new Logger(KnowledgeController.name);
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Roles({ resource: 'knowledge', action: 'create' })
  @Post()
  @UploadSingleFile({
    name: { type: 'string', required: ['name is required'] },
    desc: { type: 'string' },
    code: { type: 'string' },
    type: { type: 'string' },
    keywords: { type: 'array', items: { type: 'string' }, required: ['keywords is required'] },
  })
  async create(
    @ActiveUser() active: TPayloadToken,
    @UploadedFile() image: Express.Multer.File,
    @Body() payload: CreateKnowledgeDto,
  ) {
    //
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    const result = await this.knowledgeService.create({
      payload: { ...payload, image, keywords },
      active,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Patch('like/:id')
  async toggleLike(@Param('id') productId: string, @ActiveCustomer() { customerId }: TPayloadToken) {
    const { action, knowledge } = await this.knowledgeService.toggleLike(productId, customerId);
    return new ResponseSuccess(`Knowledge ${action} successfully`, {
      productId: knowledge.id,
      likesCount: knowledge.likes?.length || 0,
    });
  }

  @Roles({ resource: 'knowledge', action: 'update' })
  @Patch(':id')
  @UploadSingleFile()
  async update(
    @Param('id') id: string,
    @Body() payload: UpdateKnowledgeDto,
    @ActiveUser() active: TPayloadToken,
    @UploadedFile() image: Express.Multer.File,
  ) {
    //
    console.log('payload.keywords', payload.keywords);
    const keywords = UtilConvert.convertStringToArrayBySplit(payload.keywords as any, ',');

    //
    const result = await this.knowledgeService.update({
      id,
      newImage: image,
      active,
      payload: { ...payload, keywords: keywords },
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Get('for-customer')
  async findAllForCustomer(@Query() queries: AQueries<KnowledgeEntity>) {
    const results = await this.knowledgeService.findAll({
      queries,
    });

    return new ResponseSuccess('Success', results);
  }

  @Roles({ resource: 'knowledge', action: 'view' })
  @Get()
  async findAll(@Query() queries: AQueries<KnowledgeEntity>) {
    const results = await this.knowledgeService.findAll({
      queries,
    });

    return new ResponseSuccess('Success', results);
  }

  @Roles({ resource: 'knowledge', action: 'view' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.knowledgeService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Get('/for-customer/:id')
  async findOneForCustomer(@Param('id') id: string) {
    const result = await this.knowledgeService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'knowledge', action: 'delete' })
  @Delete()
  async remove(@Body() ids: string[], @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.knowledgeService.remove(ids, activeUser);
    return new ResponseSuccess('Success', result);
  }
}
