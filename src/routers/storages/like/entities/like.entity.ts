import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ILike } from 'src/interfaces/models.interface';
import { CustomerEntity } from 'src/routers/customer/entities/customer.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';
import { KnowledgeEntity } from '../../knowledge/entities/knowledge.entity';

@Entity('like')
export class LikeEntity extends ABaseEntity implements ILike {
  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL' })
  customerId: CustomerEntity;

  @ManyToOne(() => KnowledgeEntity, { onDelete: 'CASCADE' })
  knowledgeId: KnowledgeEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
