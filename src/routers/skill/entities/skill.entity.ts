import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { ISkill } from 'src/interfaces/models.interface';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity('skill')
export class SkillEntity extends ABaseEntity implements ISkill {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar' })
  image: string;

  @Column({ type: 'int' })
  progress: number;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
