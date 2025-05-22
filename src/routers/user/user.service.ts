import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Enums } from 'liemdev-profile-lib';
import { ICreateService, IFindAllService, IUpdateService } from 'src/interfaces/common.interface';
import { IUser } from 'src/interfaces/models.interface';
import { IGetMulti } from 'src/interfaces/response.interface';
import { QueueMailService } from 'src/libs/bull/queue-mail/queue-mail.service';
import { TokenService } from 'src/libs/token/token.service';
import Exception from 'src/message-validations/exception.validation';
import { UtilArray } from 'src/utils/Array.util';
import { UtilBuilder } from 'src/utils/Builder.util';
import { In, Not, Repository } from 'typeorm';
import { RoleGroupEntity } from '../role-group/entities/role-group.entity';
import { RoleGroupService } from '../role-group/role-group.service';
import { RoleEntity } from '../role/entities/role.entity';
import { RoleService } from '../role/role.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,

    @Inject(forwardRef(() => RoleService))
    private roleService: RoleService,

    @Inject(forwardRef(() => RoleGroupService))
    private roleGroupService: RoleGroupService,

    private tokenService: TokenService,
    private queueMailService: QueueMailService,
  ) {}

  onModuleInit() {
    this.initialAdmin();
  }

  async create({ payload, activeUser }: ICreateService<CreateUserDto>): Promise<UserEntity> {
    const { email: emailPayload, fullName, phone, roles, roleGroups, gender } = payload;

    // creator
    const creator = await this.verifyUser(activeUser.userId);

    // Check exist email
    const findItemByEmail = await this.userRepository.findOneBy({
      email: emailPayload,
    });
    if (findItemByEmail) {
      throw new ConflictException(Exception.exists('Email'));
    }

    // Check exist fullname
    const findItemByFullname = await this.userRepository.findOneBy({
      fullName,
    });
    if (findItemByFullname) {
      throw new ConflictException(Exception.exists('Fullname'));
    }

    // Check exist phone
    const findItemByPhone = await this.userRepository.findOneBy({ phone });
    if (findItemByPhone) {
      throw new ConflictException(Exception.exists('Phone'));
    }

    //
    let findRoles: RoleEntity[];
    if (roles?.length) {
      findRoles = await this.roleService.findManyByIds(roles);
      if (findRoles.length !== roles?.length) {
        throw new BadRequestException(Exception.bad());
      }
    }

    //
    let findRoleGroups: RoleGroupEntity[];
    if (roleGroups?.length) {
      findRoleGroups = await this.roleGroupService.findManyByIds(roleGroups);
      if (findRoleGroups.length !== roleGroups?.length) {
        throw new BadRequestException(Exception.bad());
      }
    }

    //
    await this.queueMailService.sendMail({
      to: emailPayload,
      subject: '"LiemDev 👻" <no-reply@gmail.com>',
      templateName: 'infoRegister.template',
      variables: {
        fullName,
        phone,
        gender,
        email: emailPayload,
        password: payload.password,
        linkLogin: `${process.env.CLIENT_HOST}/login`,
      },
      type: Enums.ETypeMail.FORM_REGISTER,
    });

    delete payload.passwordConfirm;
    const dataCreate = this.userRepository.create({
      ...payload,
      roles: findRoles || [],
      roleGroups: findRoleGroups || [],
      createdBy: creator,
    });
    return await this.userRepository.save(dataCreate);
  }

  async findAll({ queries, activeUser }: IFindAllService<UserEntity>): Promise<IGetMulti<UserEntity>> {
    //
    const findUser = await this.verifyUser(activeUser.userId);

    // Cách 1:
    // const exists = await this.userRepository.exists({ where: { id: userActionId } });
    // if (!exists) {
    //   throw new BadRequestException('Something went wrong, please login again.');
    // }

    // Cách 2: nếu cần logic phức tạp
    // const exists = await this.userRepository
    //   .createQueryBuilder('user')
    //   .where('user.id = :id', { id: activeUser.userId })
    //   .getExists();

    //
    const queryBuilder = new UtilBuilder<UserEntity>(this.userRepository, {
      excludeJoin: ['tokens'],
      exclude: ['email'],
    });
    const { items, totalItems } = await queryBuilder.handleConditionQueries({
      queries,
      user: findUser,
      searchField: 'fullName',
    });

    return {
      items,
      totalItems,
    };
  }

  async findManyByIds(ids: string[]): Promise<UserEntity[]> {
    //
    const findItems = await this.userRepository.findBy({
      id: In(ids),
    });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    //
    return findItems;
  }

  async findOneById(id: string): Promise<UserEntity> {
    const findItem = await this.userRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('User'));
    }
    return findItem;
  }

  async findOneRelationById(userId: string): Promise<UserEntity> {
    const findItem = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('user.roleGroups', 'roleGroups')
      .where('user.id = :id', { id: userId })
      .getOne();

    if (!findItem) {
      throw new NotFoundException(Exception.notfound('User'));
    }
    return findItem;
  }

  async findOneByEmail(email: string): Promise<UserEntity> {
    const item = await this.userRepository.findOneBy({ email });
    if (!item) {
      throw new BadRequestException(Exception.notfound('User'));
    }
    return item;
  }

  async update({ id, payload, activeUser }: IUpdateService<UpdateUserDto>): Promise<UserEntity> {
    const { roles, roleGroups, email: emailPayload, fullName, phone } = payload;

    //
    const editor = await this.verifyUser(activeUser.userId);

    // check exist
    const findItem = await this.userRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    // Check exist email
    const findItemByEmail = await this.userRepository.findOne({
      where: {
        email: emailPayload,
        id: Not(id),
      },
    });
    if (findItemByEmail) {
      throw new ConflictException(Exception.exists('Email'));
    }

    // Check exist fullname
    const findItemByFullname = await this.userRepository.findOne({
      where: { fullName, id: Not(id) },
    });
    if (findItemByFullname) {
      throw new ConflictException(Exception.exists('Fullname'));
    }

    // Check exist phone
    const findItemByPhone = await this.userRepository.findOne({
      where: { phone, id: Not(id) },
    });
    if (findItemByPhone) {
      throw new ConflictException(Exception.exists('Phone'));
    }

    //
    let findRoles: RoleEntity[];
    if (roles?.length) {
      findRoles = await this.roleService.findManyByIds(roles);
      if (findRoles.length !== roles?.length) {
        throw new BadRequestException(Exception.bad());
      }
    }

    //
    let findRoleGroups: RoleGroupEntity[];
    if (roleGroups?.length) {
      findRoleGroups = await this.roleGroupService.findManyByIds(roleGroups);
      if (findRoleGroups.length !== roleGroups?.length) {
        throw new BadRequestException(Exception.bad());
      }
    }

    //
    const itemUpdated = await this.userRepository.save({
      ...findItem,
      ...payload,
      roles: findRoles,
      roleGroups: findRoleGroups,
      updatedBy: editor,
    });

    return itemUpdated;
  }

  async block(id: string): Promise<UserEntity> {
    // check exist
    const findItem = await this.userRepository.findOneBy({ id });
    if (!findItem) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    //
    const itemUpdated = await this.userRepository.save({
      ...findItem,
      block: true,
    });

    return itemUpdated;
  }

  async revoke(ids: string[]): Promise<boolean> {
    // check exist
    const findItems = await this.userRepository.find({ where: { id: In(ids) } });
    if (findItems.length <= 0) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    //
    await this.tokenService.revokeToken({ userIds: ids });

    return true;
  }

  async remove(ids: string[]): Promise<true> {
    //
    const findItems = await this.userRepository.findBy({ id: In(ids) });

    //
    if (findItems.length !== ids.length) {
      throw new NotFoundException(Exception.notfound('User'));
    }

    //
    await Promise.all(ids.map((id) => this.userRepository.delete(id)));

    return true;
  }

  async initialAdmin() {
    const admin_fullname = process.env.ROOT_FULLNAME || 'LiemDev';
    const admin_email = process.env.ROOT_EMAIL || 'buithanhliem5073@gmail.com';
    const admin_phone = process.env.ROOT_PHONE || '0375255073';
    const admin_password = process.env.ROOT_PASSWORD || 'Liemdev123@';

    const findAdmin = await this.userRepository.findOneBy({
      fullName: admin_fullname,
      email: admin_email,
    });

    if (findAdmin) return;

    const dataAdmin = {
      isAdmin: true,
      email: admin_email,
      phone: admin_phone,
      fullName: admin_fullname,
      gender: Enums.EGender.MALE,
      password: admin_password,
    };

    const createData = this.userRepository.create(dataAdmin);
    await this.userRepository.save(createData);
  }

  async verifyUser(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({
      id,
      block: false,
    });

    if (!user) {
      throw new BadRequestException(Exception.bad());
    }

    return user;
  }

  async test(data: Partial<IUser>[]): Promise<boolean> {
    try {
      const batchSize = 5;
      const recipientChunks = UtilArray.chunkArray(data, batchSize); // [ 5items, 5items]

      //
      for (const chunk of recipientChunks) {
        await Promise.all(
          chunk.map((data) => {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
            const dataCreate = this.userRepository.create({ ...data } as any);
            this.userRepository.save(dataCreate);
          }),
        );
      }

      return true;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
