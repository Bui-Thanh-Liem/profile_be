import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CacheService } from 'src/helpers/services/Cache.service';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IRole } from 'src/interfaces/models.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UtilBuilder } from 'src/utils/Builder.util';
import { createKeyUserActive } from 'src/utils/createKeyCache';
import { DeleteResult, In, Not, Repository } from 'typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private cacheService: CacheService,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateRoleDto>): Promise<RoleEntity> {
    //
    const key = createKeyUserActive(activeUser.userId);
    const creator = await this.cacheService.getCache<UserEntity>(key);

    // Check exist name
    const findItemByName = await this.roleRepository.findOneBy({
      name: payload.name,
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Name role'));
    }

    //
    const dataCreate = this.roleRepository.create({
      ...payload,
      createdBy: creator,
    });
    const newItem = await this.roleRepository.save(dataCreate);

    return newItem;
  }

  async findAll({ queries, activeUser }: IFindAllService<IRole>): Promise<IGetMulti<RoleEntity>> {
    //
    const key = createKeyUserActive(activeUser.userId);
    const userActive = await this.cacheService.getCache<UserEntity>(key);

    //
    const queryBuilder = new UtilBuilder<RoleEntity>(this.roleRepository);
    const { items, totalItems } = await queryBuilder.handleConditionQueries({
      queries,
      user: userActive,
      searchField: 'name',
    });

    return {
      items,
      totalItems,
    };
  }

  async findManyByIds(ids: string[]): Promise<RoleEntity[]> {
    //
    const findItems = await this.roleRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Role'));
    }

    //
    return findItems;
  }

  async findOneById(id: string): Promise<RoleEntity> {
    const findItem = await this.roleRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('Role'));
    }
    return findItem;
  }

  async update({ id, payload, activeUser }: IUpdateService<UpdateRoleDto>): Promise<RoleEntity> {
    //
    const key = createKeyUserActive(activeUser.userId);
    const editor = await this.cacheService.getCache<UserEntity>(key);

    // check exist
    const findItem = await this.roleRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('role'));
    }

    // Check exist name
    const findItemByName = await this.roleRepository.findOne({
      where: {
        name: payload.name,
        id: Not(id),
      },
    });
    if (findItemByName) {
      throw new ConflictException(Exception.exists('Name role'));
    }

    //
    const itemUpdated = await this.roleRepository.save({
      ...findItem,
      ...payload,
      updatedBy: editor,
    });

    return itemUpdated;
  }

  async remove(ids: string[]): Promise<DeleteResult[]> {
    //
    const findItems = await this.roleRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('Role'));
    }

    //
    const itemDeleted = await Promise.all(ids.map((id) => this.roleRepository.delete(id)));

    return itemDeleted;
  }
}
