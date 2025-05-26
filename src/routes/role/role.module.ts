import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from './entities/role.entity';
import { RoleController } from './role.controller';
import { RoleService } from './role.service';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleEntity]), HelperModule],
  controllers: [RoleController],
  providers: [RoleService],
  exports: [RoleService],
})
export class RoleModule {}
