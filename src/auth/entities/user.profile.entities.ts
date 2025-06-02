import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base';
import { UserEntitiy } from './users.entity';

@Entity('profiles')
export class Profile extends BaseEntity {
  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'date', nullable: true, name: 'date_of_birth' })
  dateOfBirth: string;

  @Column()
  gender: number;

  @Column({ nullable: true, name: 'phone_number', unique: true })
  phoneNumber: string;

  @Column({ nullable: true, unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ nullable: true })
  districtId: number;

  @Column({ nullable: true })
  provinceId: number;

  @Column({ nullable: true })
  wardId: number;

  @Column({ nullable: true })
  countryId: number;

  @Column({ nullable: true })
  nationId: number;

  @OneToOne(() => UserEntitiy, (user) => user.profile)
  @JoinColumn()
  user: UserEntitiy;
}
