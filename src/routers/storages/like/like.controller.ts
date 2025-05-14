import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Customer } from 'src/decorators/customer.decorator';
import { ResponseSuccess } from 'src/classes/response.class';

@Controller('like')
export class LikeController {
  private readonly logger = new Logger(LikeController.name);
  constructor(private readonly likeService: LikeService) {}

  @Post()
  @Customer()
  async create(@Body() payload: CreateLikeDto) {
    this.logger.debug(`payload::: ${JSON.stringify(payload)}`);
    const results = await this.likeService.create(payload);
    return new ResponseSuccess('Success', results);
  }

  @Get()
  @Customer()
  findAll() {
    return this.likeService.findAll();
  }

  @Get(':id')
  @Customer()
  findOne(@Param('id') id: string) {
    return this.likeService.findOne(+id);
  }

  @Patch(':id')
  @Customer()
  update(@Param('id') id: string, @Body() updateLikeDto: UpdateLikeDto) {
    return this.likeService.update(+id, updateLikeDto);
  }

  @Delete(':id')
  @Customer()
  remove(@Param('id') id: string) {
    return this.likeService.remove(+id);
  }
}
