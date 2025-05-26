import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { IRoleGroup } from 'src/interfaces/models.interface';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { RoleGroupService } from './role-group.service';
import { Roles } from 'src/decorators/role.decorator';

@Controller(Constants.CONSTANT_ROUTE.ROLE_GROUP)
export class RoleGroupController {
  constructor(private readonly roleGroupService: RoleGroupService) {}

  @Roles({ resource: 'role-group', action: 'create' })
  @Post()
  async create(@Body() payload: CreateRoleGroupDto, @ActiveUser() active: TPayloadToken) {
    const result = await this.roleGroupService.create({ payload, active });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role-group', action: 'view' })
  @Get()
  async findAll(@Query() queries: AQueries<IRoleGroup>, @ActiveUser() active: TPayloadToken) {
    const result = await this.roleGroupService.findAll({
      queries,
      active,
    });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role-group', action: 'view' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.roleGroupService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role-group', action: 'update' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateRoleGroupDto, @ActiveUser() active: TPayloadToken) {
    const result = await this.roleGroupService.update({
      id,
      payload,
      active,
    });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role-group', action: 'delete' })
  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.roleGroupService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
