import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueMailModule } from 'src/libs/bull/queue-mail/queue-mail.module';
import { RoleGroupModule } from '../role-group/role-group.module';
import { RoleModule } from '../role/role.module';
import { UserEntity } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TokenModule } from 'src/libs/token/token.module';
import { HelperModule } from 'src/helpers/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    forwardRef(() => RoleModule),
    forwardRef(() => RoleGroupModule),
    QueueMailModule,
    TokenModule,
    HelperModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
