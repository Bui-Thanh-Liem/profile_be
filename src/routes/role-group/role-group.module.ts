import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelperModule } from 'src/helpers/helper.module';
import { RoleModule } from '../role/role.module';
import { RoleGroupEntity } from './entities/role-group.entity';
import { RoleGroupController } from './role-group.controller';
import { RoleGroupService } from './role-group.service';

@Module({
  imports: [TypeOrmModule.forFeature([RoleGroupEntity]), RoleModule, HelperModule],
  controllers: [RoleGroupController],
  providers: [RoleGroupService],
  exports: [RoleGroupService],
})
export class RoleGroupModule {}
