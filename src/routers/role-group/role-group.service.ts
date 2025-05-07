import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UtilBuilder } from 'src/utils/Builder.util';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IRoleGroup } from 'src/interfaces/models.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { In, Not, Repository } from 'typeorm';
import { RoleService } from '../role/role.service';
import { UserService } from '../user/user.service';
import { CreateRoleGroupDto } from './dto/create-role-group.dto';
import { UpdateRoleGroupDto } from './dto/update-role-group.dto';
import { RoleGroupEntity } from './entities/role-group.entity';

@Injectable()
export class RoleGroupService {
  constructor(
    @InjectRepository(RoleGroupEntity)
    private roleGroupRepository: Repository<RoleGroupEntity>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,

    @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateRoleGroupDto>): Promise<RoleGroupEntity> {
    const { name, roles } = payload;
    //
    const creator = await this.userService.findOneById(activeUser.userId);
    if (!creator) {
      throw new BadRequestException(Exception.bad());
    }

    // Check exist name
    const findItemByName = await this.roleGroupRepository.findOneBy({
      name: name,
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Name role group'));
    }

    //
    const findRoles = await this.roleService.findManyByIds(roles);

    //
    const dataCreate = this.roleGroupRepository.create({
      ...payload,
      roles: findRoles,
      createdBy: creator,
    });
    const newItem = await this.roleGroupRepository.save(dataCreate);

    return newItem;
  }

  async findAll({ queries, activeUser }: IFindAllService<IRoleGroup>): Promise<IGetMulti<RoleGroupEntity>> {
    //
    const findUser = await this.userService.findOneById(activeUser.userId);
    if (!findUser) {
      throw new BadRequestException(Exception.bad());
    }

    //
    const queryBuilder = new UtilBuilder<RoleGroupEntity>(this.roleGroupRepository);
    const { items, totalItems } = await queryBuilder.handleConditionQueries({
      queries,
      user: findUser,
      searchField: 'name',
    });

    return {
      items,
      totalItems,
    };
  }

  async findManyByIds(ids: string[]): Promise<RoleGroupEntity[]> {
    //
    const findItems = await this.roleGroupRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Role Group'));
    }

    //
    return findItems;
  }

  async findOneById(id: string) {
    const findItem = await this.roleGroupRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Role Group'));
    }
    return findItem;
  }

  async update({ id, payload, activeUser }: IUpdateService<UpdateRoleGroupDto>): Promise<RoleGroupEntity> {
    const { roles } = payload;

    //
    const editor = await this.userService.findOneById(activeUser.userId);
    if (!editor) {
      throw new BadRequestException(Exception.bad());
    }

    // check exist
    const findItem = await this.roleGroupRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Role Group'));
    }

    // Check exist name
    const findItemByName = await this.roleGroupRepository.findOne({
      where: {
        name: payload.name,
        id: Not(id),
      },
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Name role group'));
    }

    //
    const findRoles = await this.roleService.findManyByIds(roles);
    if (findRoles.length !== roles?.length) {
      throw new BadRequestException(Exception.bad());
    }

    //
    const itemUpdated = await this.roleGroupRepository.save({
      ...findItem,
      ...payload,
      roles: findRoles,
      updatedBy: editor,
    });

    return itemUpdated;
  }

  async remove(ids: string[]) {
    //
    const findItems = await this.roleGroupRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Role Group'));
    }

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.roleGroupRepository.delete(id)));

    return itemDeleted;
  }
}
