import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Constants } from 'liemdev-profile-lib';
import AQueries from 'src/abstracts/AQuery.abstract';
import { ResponseSuccess } from 'src/classes/response.class';
import { ActiveUser } from 'src/decorators/activeUser.decorator';
import { IRole } from 'src/interfaces/models.interface';
import { TPayloadToken } from 'src/types/TPayloadToken.type';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleService } from './role.service';
import { Roles } from 'src/decorators/role.decorator';

@Controller(Constants.CONSTANT_ROUTE.ROLE)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Roles({ resource: 'role', action: 'create' })
  @Post()
  async create(@Body() payload: CreateRoleDto, @ActiveUser() active: TPayloadToken) {
    console.log('payload controller:::', payload);

    const result = await this.roleService.create({ payload, active });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role', action: 'view' })
  @Get()
  async findAll(@Query() queries: AQueries<IRole>, @ActiveUser() active: TPayloadToken) {
    const result = await this.roleService.findAll({ queries, active });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role', action: 'view' })
  @Get(':id')
  async findOneById(@Param('id') id: string) {
    const result = await this.roleService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role', action: 'update' })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateRoleDto, @ActiveUser() active: TPayloadToken) {
    const result = await this.roleService.update({ id, payload, active });
    return new ResponseSuccess('Success', result);
  }

  @Roles({ resource: 'role', action: 'delete' })
  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.roleService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
