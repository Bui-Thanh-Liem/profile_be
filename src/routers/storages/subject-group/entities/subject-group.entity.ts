import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { SubjectItemEntity } from '../../subject-item/entities/subject-item.entity';

@Entity('subject_groups')
export class SubjectGroupEntity extends ABaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({
    type: 'enum',
    enum: Enums.ETypeSubject,
  })
  type: Enums.ETypeSubject;

  @ManyToMany(() => SubjectItemEntity, (subjectItem) => subjectItem.groups)
  @JoinTable({
    name: 'subject_group_items',
    joinColumn: { name: 'group_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'item_id', referencedColumnName: 'id' },
  })
  items: SubjectItemEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
