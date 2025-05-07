import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../user/user.module';
import { ImageStorageEntity } from './entities/image-storage.entity';
import { ImageStorageController } from './image-storage.controller';
import { ImageStorageService } from './image-storage.service';
import { KeyWordModule } from '../keyword/keyword.module';
import { KeywordEntity } from '../keyword/entities/keyword.entity';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([ImageStorageEntity, KeywordEntity]), UserModule, HelperModule, KeyWordModule],
  controllers: [ImageStorageController],
  providers: [ImageStorageService],
})
export class ImageStorageModule {}
