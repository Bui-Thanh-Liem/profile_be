import { Module } from '@nestjs/common';
import { LikeService } from './like.service';
import { LikeController } from './like.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeEntity } from './entities/like.entity';
import { CustomerModule } from 'src/routers/customer/customer.module';
import { SubjectItemModule } from '../subject-item/subject-item.module';

@Module({
  imports: [TypeOrmModule.forFeature([LikeEntity]), CustomerModule, SubjectItemModule],
  controllers: [LikeController],
  providers: [LikeService],
})
export class LikeModule {}
