import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { UtilSlug } from 'src/utils/Slug.util';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { KeywordEntity } from '../../keyword/entities/keyword.entity';
import { SubjectGroupEntity } from '../../subject-group/entities/subject-group.entity';

@Entity('subject_items')
export class SubjectItemEntity extends ABaseEntity {
  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  desc: string;

  @Column('text')
  code: string;

  @Column()
  image: string;

  @ManyToMany(() => KeywordEntity, (keyword) => keyword.subjectItems)
  @JoinTable({
    name: 'subject_item_keywords',
    joinColumn: { name: 'item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'keyword_id', referencedColumnName: 'id' },
  })
  keywords: KeywordEntity[];

  @Column({
    type: 'enum',
    enum: Enums.ETypeSubject,
  })
  type: Enums.ETypeSubject;

  @ManyToMany(() => SubjectGroupEntity, (subjectGroup) => subjectGroup.items, { nullable: true })
  groups: SubjectGroupEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;

  @BeforeInsert()
  @BeforeUpdate()
  createSlug?() {
    this.slug = UtilSlug.generaSlug(this.name);
  }
}
