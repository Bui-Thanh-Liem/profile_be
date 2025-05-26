import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ICustomer, INote } from 'src/interfaces/models.interface';
import { CustomerEntity } from 'src/routes/customer/entities/customer.entity';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('note')
export class NoteEntity extends ABaseEntity implements INote {
  @Column({ type: 'varchar', unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ type: 'varchar', length: 10, nullable: true, default: '#04befe' })
  color: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: Enums.EStatus;

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL' })
  customerId: ICustomer;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
