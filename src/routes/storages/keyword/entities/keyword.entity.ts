import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { KnowledgeEntity } from '../../knowledge/entities/knowledge.entity';

@Entity('keyword')
export class KeywordEntity extends ABaseEntity {
  @Column({ type: 'varchar', unique: true, length: 50 })
  name: string;

  @Column({ type: 'varchar', default: '#04befe', length: 10 })
  color: string;

  @ManyToMany(() => KnowledgeEntity, (knowledge) => knowledge.keywords, {
    cascade: ['remove'],
  })
  knowledge: KnowledgeEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
