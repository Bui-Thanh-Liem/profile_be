import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { RoleGroupEntity } from 'src/routers/role-group/entities/role-group.entity';
import { RoleEntity } from 'src/routers/role/entities/role.entity';
import { TokenEntity } from 'src/libs/token/entities/token.entity';
import { IUser } from 'src/interfaces/models.interface';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

@Entity('user')
export class UserEntity extends ABaseEntity implements IUser {
  @Column({ type: 'varchar', unique: true })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'enum', enum: Enums.EGender, default: Enums.EGender.MALE })
  gender: Enums.EGender;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  phone: string;

  @ManyToMany(() => RoleEntity, (role) => role.users)
  roles: RoleEntity[];

  @ManyToMany(() => RoleGroupEntity, (roleGroup) => roleGroup.users)
  roleGroups: RoleGroupEntity[];

  @OneToMany(() => TokenEntity, (token) => token.user, { cascade: true })
  tokens: TokenEntity[];

  @Column({ type: 'boolean', default: false })
  isSubAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  isAdmin: boolean;

  @Column({ type: 'boolean', default: false })
  block: boolean;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @Expose()
  get test() {
    return `${this.email} - ${this.fullName}`;
  }

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (!this.password) {
      throw new BadRequestException('Password cannot be empty');
    }
    this.password = await bcrypt.hash(this.password, 10);
  }

  validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }
}
