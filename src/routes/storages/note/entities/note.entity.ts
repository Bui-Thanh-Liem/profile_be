import { Enums } from 'liemdev-profile-lib';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ICustomer } from 'src/interfaces/models.interface';
import { CustomerEntity } from 'src/routes/customer/entities/customer.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('note')
export class NoteEntity extends ABaseEntity {
  @Column({ type: 'varchar', length: 100, unique: true })
  title: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @Column({ type: 'varchar', length: 10, nullable: true, default: '#04befe' })
  color: string;

  @Column({ type: 'timestamp' })
  date: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  status: Enums.EStatus;

  @Column({ type: 'bool', nullable: true, default: false })
  isOutStand: boolean;

  @Column({ type: 'bool', nullable: true, default: false })
  pin: boolean;

  @ManyToOne(() => CustomerEntity, { onDelete: 'SET NULL' })
  customer: ICustomer;
}
