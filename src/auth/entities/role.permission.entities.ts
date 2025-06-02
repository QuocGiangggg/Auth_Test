import { Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Role } from './role.entities';
import { Permission } from './permission.entities';
import { BaseEntity } from './base';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
  @ManyToOne(() => Role, (role) => role.rolePermissions)
  @JoinColumn({ name: 'roleId' }) // Tên cột trong database
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions)
  @JoinColumn({ name: 'permissionId' }) // Tên cột trong database
  permission: Permission;
}