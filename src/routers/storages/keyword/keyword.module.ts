import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KeywordEntity } from './entities/keyword.entity';
import { KeyWordController } from './keyword.controller';
import { KeywordService } from './keyword.service';
import { UserModule } from 'src/routers/user/user.module';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([KeywordEntity])],
  controllers: [KeyWordController],
  providers: [KeywordService],
  exports: [KeywordService],
})
export class KeyWordModule {}
