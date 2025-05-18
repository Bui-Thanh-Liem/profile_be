import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { RoleGroupEntity } from 'src/routers/role-group/entities/role-group.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { IRole } from 'src/interfaces/models.interface';
import { IRoleDataResource } from 'src/interfaces/role.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('role')
export class RoleEntity extends ABaseEntity implements IRole {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ type: 'json' })
  dataSources: IRoleDataResource[];

  @ManyToMany(() => UserEntity, (user) => user.roles, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'role_user',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserEntity[];

  @ManyToMany(() => RoleGroupEntity, (roleGroup) => roleGroup.roles, {
    onDelete: 'CASCADE',
  })
  roleGroups: RoleGroupEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
