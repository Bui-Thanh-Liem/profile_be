import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { SkillEntity } from './entities/skill.entity';
import { SkillController } from './skill.controller';
import { SkillService } from './skill.service';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([SkillEntity]), UserModule, HelperModule],
  controllers: [SkillController],
  providers: [SkillService],
})
export class SkillModule {}
