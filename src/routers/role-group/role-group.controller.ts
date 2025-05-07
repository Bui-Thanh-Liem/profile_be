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

@Controller(Constants.CONSTANT_ROUTE.ROLE_GROUP)
export class RoleGroupController {
  constructor(private readonly roleGroupService: RoleGroupService) {}

  @Post()
  async create(@Body() payload: CreateRoleGroupDto, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.roleGroupService.create({ payload, activeUser });
    return new ResponseSuccess('Success', result);
  }

  @Get()
  async findAll(@Query() queries: AQueries<IRoleGroup>, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.roleGroupService.findAll({
      queries,
      activeUser,
    });
    return new ResponseSuccess('Success', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.roleGroupService.findOneById(id);
    return new ResponseSuccess('Success', result);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() payload: UpdateRoleGroupDto, @ActiveUser() activeUser: TPayloadToken) {
    const result = await this.roleGroupService.update({
      id,
      payload,
      activeUser,
    });
    return new ResponseSuccess('Success', result);
  }

  @Delete()
  async remove(@Body() ids: string[]) {
    const result = await this.roleGroupService.remove(ids);
    return new ResponseSuccess('Success', result);
  }
}
