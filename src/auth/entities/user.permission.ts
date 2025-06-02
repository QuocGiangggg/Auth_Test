import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { UserEntitiy } from './users.entity';
import { Permission } from './permission.entity';
import { BaseEntity } from './base';

@Entity('UserPermissions')
export class UserPermission extends BaseEntity {
  @ManyToOne(() => UserEntitiy, (user) => user.userPermissions)
  @JoinColumn()
  user: UserEntitiy;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions)
  @JoinColumn()
  permission: Permission;

  @Column({ nullable: true, type: 'date' })
  expired: Date;
}
