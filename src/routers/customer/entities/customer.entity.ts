import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';
import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { ICustomer } from 'src/interfaces/models.interface';
import { TokenEntity } from 'src/libs/token/entities/token.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity('customer')
export class CustomerEntity extends ABaseEntity implements ICustomer {
  @Column({ type: 'varchar', unique: true, nullable: true })
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  avatar: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', nullable: true, default: '' })
  password?: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'varchar', nullable: true })
  accessToken: string;

  @Column({ type: 'varchar', nullable: true })
  refreshToken: string;

  @OneToMany(() => TokenEntity, (token) => token.user, { cascade: true })
  tokens: TokenEntity[];

  @Column({ type: 'boolean', default: false })
  block: boolean;

  @Column({ type: 'boolean', default: false })
  status: boolean;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    // kiểm tra rỗng password tại dto của form đăng nhập không phải Google (có pass là từ form)
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  validatePassword(password: string) {
    return bcrypt.compare(password, this.password);
  }

  constructor(partial: Partial<any>) {
    super();
    Object.assign(this, partial);
  }
}
