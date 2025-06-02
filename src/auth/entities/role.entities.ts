import { Entity, Column, OneToMany, ManyToOne } from 'typeorm';
import { BaseEntity } from './base';
import { UserRole } from './user.role.entities';
import { RolePermission } from './role.permission.entities';

@Entity('roles')
export class Role extends BaseEntity {
  @Column({ name: 'name' })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ nullable: true, default: false })
  isHiden: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];

  @ManyToOne(() => Role, (role) => role.children)
  parent: Role;

  @OneToMany(() => Role, (role) => role.parent)
  children: Role[];
}
