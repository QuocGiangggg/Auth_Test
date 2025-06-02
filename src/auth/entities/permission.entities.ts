import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base';
import { RolePermission } from './role.permission.entities';
import { UserPermission } from './user.permission';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  action: string;

  @Column({ type: 'text', nullable: true })
  module: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(
    () => RolePermission,
    (rolePermission) => rolePermission.permission,
  )
  rolePermissions: RolePermission[];
  @OneToMany(
    () => UserPermission, 
    (userPermission) => userPermission.user)
  userPermissions: UserPermission[];
}
