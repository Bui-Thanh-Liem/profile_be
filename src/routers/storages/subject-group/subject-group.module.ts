import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from 'src/routers/user/user.module';
import { SubjectItemModule } from '../subject-item/subject-item.module';
import { SubjectGroupEntity } from './entities/subject-group.entity';
import { SubjectGroupController } from './subject-group.controller';
import { SubjectGroupService } from './subject-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectGroupEntity]), forwardRef(() => SubjectItemModule), UserModule],
  controllers: [SubjectGroupController],
  providers: [SubjectGroupService],
  exports: [SubjectGroupService],
})
export class SubjectGroupModule {}
