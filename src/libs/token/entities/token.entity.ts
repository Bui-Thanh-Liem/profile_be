import { ABaseEntity } from 'src/abstracts/ABaseEntity.abstract';
import { CustomerEntity } from 'src/routers/customer/entities/customer.entity';
import { UserEntity } from 'src/routers/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('token')
export class TokenEntity extends ABaseEntity {
  @Column({ type: 'varchar', unique: true })
  token: string;

  @Column({ type: 'varchar', nullable: true, unique: true })
  refreshToken: string; // Lưu refresh token để tạo lại access token sau khi hết hạn.

  @ManyToOne(() => UserEntity, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: Omit<UserEntity, 'password'>;

  @ManyToOne(() => CustomerEntity, (cus) => cus.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customer_id' })
  customer: Omit<CustomerEntity, 'password'>;

  @Column({ type: 'boolean', default: false })
  isRevoked: boolean; // Lưu trạng thái token (đã bị thu hồi chưa). cho người dùng out khỏi phiên làm việc hiện tại của token, ngay cả khi token con hạn

  @Column({ type: 'timestamp' })
  expiresAt: Date; // Thời gian hết hạn của access token.

  @Column({ type: 'timestamp', nullable: true })
  refreshTokenExpiresAt: Date; // Thời gian hết hạn của refresh token.

  @Column({ type: 'varchar', nullable: true })
  deviceInfo: string;

  @Column({ type: 'varchar', nullable: true })
  ipAddress: string; // Lưu địa chỉ IP của người dùng khi tạo token.

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  createdBy: UserEntity;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  updatedBy: UserEntity;

  // kiểm tra access token hết hạn
  isExpired(): boolean {
    if (!this.expiresAt) return true;
    return new Date() > this.expiresAt;
  }

  // kiểm tra refresh token hết hạn
  isRefreshTokenExpired(): boolean {
    if (!this.refreshTokenExpiresAt) return true;
    return new Date() > this.refreshTokenExpiresAt;
  }
}
