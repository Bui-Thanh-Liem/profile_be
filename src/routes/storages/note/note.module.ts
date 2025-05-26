import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from 'src/helpers/helper.module';
import { NoteEntity } from './entities/note.entity';
import { NoteController } from './note.controller';
import { NoteService } from './note.service';

@Module({
  imports: [TypeOrmModule.forFeature([NoteEntity]), HelperModule],
  controllers: [NoteController],
  providers: [NoteService],
})
export class NoteModule {}
