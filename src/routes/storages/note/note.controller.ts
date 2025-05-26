import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveCustomer } from 'src/decorators/activeCustomer.decorator';
import { Customer } from 'src/decorators/customer.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteEntity } from './entities/note.entity';
import { NoteService } from './note.service';

@Controller('note')
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Customer()
  @Post()
  async create(@Body() payload: CreateNoteDto, @ActiveCustomer() active: TPayloadToken) {
    const result = await this.noteService.create({
      payload,
      active,
    });

    //
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Get()
  async findAll(@Query() queries: AQueries<NoteEntity>, @ActiveCustomer() active: TPayloadToken) {
    const result = await this.noteService.findAll({ queries, active });
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.noteService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Customer()
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateNoteDto, @ActiveCustomer() active: TPayloadToken) {
    const results = await this.noteService.update({ id, active, payload });
    return new ResponseSuccess('Success', results);
  }

  @Delete(':id')
  remove(@Body() ids: string[], @ActiveCustomer() active: TPayloadToken) {
    return this.noteService.remove(ids, active);
  }
}
