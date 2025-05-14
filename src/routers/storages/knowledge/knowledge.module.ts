import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from 'src/helpers/helper.module';
import { UserModule } from 'src/routers/user/user.module';
import { KeyWordModule } from '../keyword/keyword.module';
import { KnowledgeEntity } from './entities/knowledge.entity';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeService } from './knowledge.service';

@Module({
  imports: [UserModule, KeyWordModule, HelperModule, TypeOrmModule.forFeature([KnowledgeEntity])],
  controllers: [KnowledgeController],
  providers: [KnowledgeService],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
