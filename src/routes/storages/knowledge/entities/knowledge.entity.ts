import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { IKnowledge } from 'src/interfaces/models.interface';
import { CustomerEntity } from 'src/routes/customer/entities/customer.entity';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { UtilSlug } from 'src/utils/Slug.util';
import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { KeywordEntity } from '../../keyword/entities/keyword.entity';

@Entity('knowledge')
export class KnowledgeEntity extends ABaseEntity implements IKnowledge {
  @Column({ type: 'varchar', length: 40 })
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column('text')
  desc: string;

  @Column('longtext')
  code: string;

  @Column()
  image: string;

  @Column({ type: 'int', nullable: true, default: 0 })
  rate: number;

  @ManyToMany(() => CustomerEntity, { onDelete: 'CASCADE' })
  @JoinTable({
    name: 'knowledge_likes',
    joinColumn: { name: 'knowledge_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'customer_id', referencedColumnName: 'id' },
  })
  likes: CustomerEntity[];

  @Column({ type: 'int', default: 0 })
  likeCount: number;

  @ManyToMany(() => KeywordEntity, (keyword) => keyword.knowledge)
  @JoinTable({
    name: 'knowledge_keywords',
    joinColumn: { name: 'item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'keyword_id', referencedColumnName: 'id' },
  })
  keywords: KeywordEntity[];

  @Column({
    type: 'enum',
    enum: Enums.ETypeKnowledge,
  })
  type: Enums.ETypeKnowledge;

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
