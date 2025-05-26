import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { AboutController } from './about.controller';
import { AboutService } from './about.service';
import { AboutEntity } from './entities/about.entity';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [UserModule, HelperModule, TypeOrmModule.forFeature([AboutEntity])],
  controllers: [AboutController],
  providers: [AboutService],
})
export class AboutModule {}
