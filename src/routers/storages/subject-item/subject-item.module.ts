import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from 'src/helpers/helper.module';
import { UserModule } from 'src/routers/user/user.module';
import { KeyWordModule } from '../keyword/keyword.module';
import { SubjectGroupModule } from '../subject-group/subject-group.module';
import { SubjectItemEntity } from './entities/subject-item.entity';
import { SubjectItemController } from './subject-item.controller';
import { SubjectItemService } from './subject-item.service';

@Module({
  imports: [
    UserModule,
    KeyWordModule,
    forwardRef(() => SubjectGroupModule),
    HelperModule,
    TypeOrmModule.forFeature([SubjectItemEntity]),
  ],
  controllers: [SubjectItemController],
  providers: [SubjectItemService],
  exports: [SubjectItemService],
})
export class SubjectItemModule {}
