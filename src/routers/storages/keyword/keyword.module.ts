import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordEntity } from './entities/keyword.entity';
import { KeyWordController } from './keyword.controller';
import { KeywordService } from './keyword.service';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([KeywordEntity]), HelperModule],
  controllers: [KeyWordController],
  providers: [KeywordService],
  exports: [KeywordService],
})
export class KeyWordModule {}
