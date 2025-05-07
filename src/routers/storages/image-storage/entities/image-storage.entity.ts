import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from 'typeorm';
import { KeywordEntity } from '../../keyword/entities/keyword.entity';

@Entity('image_storage')
export class ImageStorageEntity extends ABaseEntity {
  @Column({ type: 'varchar', unique: true })
  label: string;

  @Column({ type: 'text', nullable: true })
  desc: string;

  @ManyToMany(() => KeywordEntity, (keyword) => keyword.imageStorages, {
    onDelete: 'CASCADE',
  })
  @JoinTable({
    // tạo bảng trung gian
    name: 'image_storage_keyword',
    joinColumn: {
      name: 'image_storage_id', // bảng hiện tại
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'keyword_id', // bảng bảng quan hệ
      referencedColumnName: 'id',
    },
  })
  keywords: KeywordEntity[];

  @Column({ type: 'json' })
  images: string[];

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;
}
