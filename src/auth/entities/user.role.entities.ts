import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntitiy } from './users.entity';
import { Role } from './role.entity';
import { BaseEntity } from './base';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @ManyToOne(() => UserEntitiy, (user) => user.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: UserEntitiy;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn()
  role: Role;
}
