import {
  Column,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  Unique,
} from 'typeorm';
import { BaseEntity } from './base';
import { Profile } from './user.profile.entities';
import { UserRole } from './user.role.entities';
import { UserPermission } from './user.permission';
import { CardInfo } from './user.card.info.entities';

@Entity({ name: 'users' })
@Unique(['userName', 'deletedAt'])
export class UserEntitiy extends BaseEntity {
  @Column()
  @Generated('uuid')
  uuid: string;
  @Column({ unique: true })
  userName: string;

  @Column({ nullable: true })
  avatar: number;

  @Column()
  password: string;
  @OneToOne(() => Profile, (profile) => profile.user, {
    cascade: true,
    nullable: true,
  })
  profile: Profile;

  @OneToOne(() => CardInfo, (cardInfo) => cardInfo.user, {
    cascade: true,
    nullable: true,
  })
  cardInfo: CardInfo;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToMany(() => UserPermission, (userPermission) => userPermission.user)
  userPermissions: UserPermission[];

  @Column({ default: true })
  actived: boolean;
}
