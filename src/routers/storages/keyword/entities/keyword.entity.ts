import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ImageStorageEntity } from 'src/routers/storages/image-storage/entities/image-storage.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { SubjectItemEntity } from '../../subject-item/entities/subject-item.entity';

@Entity('keyword')
export class KeywordEntity extends ABaseEntity {
  @Column({ type: 'varchar', unique: true })
  name: string;

  @Column({ type: 'varchar', default: '#04befe', length: 10 })
  color: string;

  @ManyToMany(() => ImageStorageEntity, (imageStorage) => imageStorage.keywords, { cascade: ['remove'] })
  imageStorages: ImageStorageEntity[];

  @ManyToMany(() => SubjectItemEntity, (subjectItem) => subjectItem.keywords, {
    cascade: ['remove'],
  })
  subjectItems: SubjectItemEntity[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
