import { Body, Controller, Delete, Get, Param, Patch, Post, Query, SerializeOptions } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { Roles } from 'src/decorators/role.decorator';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { BlockUserDto } from './dto/block-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { RevokeUserDto } from './dto/revoke-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller(Constants.CONSTANT_ROUTE.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Roles({ resource: 'user', action: 'create' })
  @Post()
  @SerializeOptions({ type: UserEntity })
  async create(@Body() payload: CreateUserDto, @ActiveUser() active: TPayloadToken) {
    const result = await this.userService.create({ payload, active });
    return new ResponseSuccess('Success', result);
  }

  /*
   * Trong các phiên bản mới nhất của NestJS
   * (tính đến tháng 4/2025, phiên bản mới nhất là
   * khoảng NestJS 10.x hoặc cao hơn), khi sử dụng
   * ClassSerializerInterceptor cùng với thư viện @nestjs/class-serializer,
   * bạn không cần phải tự tay ánh xạ (map) các đối tượng sang thực thể
   * (entity) như new UserEntity(item) nữa.
   */

  @Roles({ resource: 'user', action: 'view' })
  // @UseInterceptors(ClassSerializerInterceptor) // sử dụng global
  @Get()
  async findAll(@Query() queries: AQueries<UserEntity>, @ActiveUser() active: TPayloadToken) {
    const { items, totalItems } = await this.userService.findAll({ queries, active });

    // Serialization
    // const serializationItems = items.map((item) => new UserEntity(item));

    return new ResponseSuccess('Success', { items, totalItems });
  }

  @Roles({ resource: 'user', action: 'view' })
  @Get('ids')
  async findManyByIds(@Body() ids: string[]) {
    const result = await this.userService.findManyByIds(ids);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'user', action: 'view' })
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.userService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'user', action: 'update' })
  @Patch('revoke')
  async revoke(@Body() payload: RevokeUserDto, @ActiveUser() activeUser: TPayloadToken) {
    console.log('user revoke lala');

    const result = await this.userService.revoke(payload.userIds, activeUser.userId);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'user', action: 'update' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateUserDto, @ActiveUser() active: TPayloadToken) {
    const result = await this.userService.update({ id, payload, active });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'user', action: 'update' })
  @Patch('block/:id')
  async block(@Param('id') payload: BlockUserDto, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.userService.toggleBlock(payload.id, activeUser.userId);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'user', action: 'delete' })
  @Delete()
  async remove(@Body() ids: string[], @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.userService.remove(ids, activeUser.userId);
    return new ResponseSuccess('Success', result);
  }
}
