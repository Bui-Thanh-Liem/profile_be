import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routes/user/entities/user.entity';
import { IAbout } from 'src/interfaces/models.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('about')
export class AboutEntity extends ABaseEntity implements IAbout {
  @Column({ type: 'json' })
  text: string[];

  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  phone: string;

  @Column({ type: 'varchar' })
  address: string;

  @Column({ type: 'varchar' })
  image: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
