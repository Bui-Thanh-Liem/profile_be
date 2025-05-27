import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { RoleEntity } from 'src/routes/role/entities/role.entity';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { IRoleGroup } from 'src/interfaces/models.interface';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';

@Entity('role_group')
export class RoleGroupEntity extends ABaseEntity implements IRoleGroup {
  @Column({ type: 'varchar', unique: true, length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @ManyToMany(() => RoleEntity, (role) => role.roleGroups, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    name: 'role_group_role',
    joinColumn: { name: 'role_group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: RoleEntity[];

  @ManyToMany(() => UserEntity, (user) => user.roleGroups, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'role_group_user',
    joinColumn: {
      name: 'role_group_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
  })
  users: UserEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
