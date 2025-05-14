import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ICustomer, ILike, ISubjectItem } from 'src/interfaces/models.interface';
import { CustomerEntity } from 'src/routers/customer/entities/customer.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Entity, ManyToOne } from 'typeorm';
import { SubjectItemEntity } from '../../subject-item/entities/subject-item.entity';

@Entity('like')
export class LikeEntity extends ABaseEntity implements ILike {
  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL' })
  customerId: ICustomer;

  @ManyToOne(() => SubjectItemEntity, { onDelete: 'CASCADE' })
  subjectItemId: ISubjectItem;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
