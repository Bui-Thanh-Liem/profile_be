import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IRole } from 'src/interfaces/models.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import Exception from 'src/message-validations/exception.validation';
import { UtilBuilder } from 'src/utils/Builder.util';
import { DeleteResult, In, Not, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,

    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async create({ payload, activeUser }: ICreateService<CreateRoleDto>): Promise<RoleEntity> {
    //
    const creator = await this.userService.findOneById(activeUser.userId);
    if (!creator) {
      throw new BadRequestException(Exception.bad());
    }

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
    const findUser = await this.userService.findOneById(activeUser.userId);
    if (!findUser) {
      throw new BadRequestException(Exception.bad());
    }

    //
    const queryBuilder = new UtilBuilder<RoleEntity>(this.roleRepository);
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
    const editor = await this.userService.findOneById(activeUser.userId);
    if (!editor) {
      throw new BadRequestException(Exception.bad());
    }

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
