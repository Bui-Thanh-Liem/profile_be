import { forwardRef, Module } from '@nestjs/common';
import { RoleGroupController } from './role-group.controller';
import { RoleGroupService } from './role-group.service';
import { UserModule } from '../user/user.module';
import { RoleModule } from '../role/role.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleGroupEntity } from './entities/role-group.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RoleGroupEntity]), forwardRef(() => UserModule), forwardRef(() => RoleModule)],
  controllers: [RoleGroupController],
  providers: [RoleGroupService],
  exports: [RoleGroupService],
})
export class RoleGroupModule {}
