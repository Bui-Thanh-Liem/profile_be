import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerModule } from 'src/routers/customer/customer.module';
import { KnowledgeModule } from '../knowledge/knowledge.module';
import { LikeEntity } from './entities/like.entity';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity]), CustomerModule, KnowledgeModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
