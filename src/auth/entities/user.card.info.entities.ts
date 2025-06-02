import { Entity, Column, OneToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base';
import { UserEntitiy } from './user.entities';

@Entity({ name: 'card_info' })
export class CardInfo extends BaseEntity {
  @Column()
  fullName: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ type: 'text', nullable: true })
  placeOfOrigin: string;

  @Column({ type: 'text', nullable: true })
  placeOfResident: string;

  @Column({ type: 'text', nullable: true })
  idNumber: string;

  @Column({ type: 'date', nullable: true })
  dateOfExpiry: string;

  @Column({ type: 'date', nullable: true })
  issueDate: string;

  @Column({ type: 'date', nullable: true })
  issueBy: string;

  @Column({ type: 'text', nullable: true })
  personalIdentification: string;

  @Column({ type: 'bigint', nullable: true })
  mediaCardFontId: number;

  @Column({ type: 'bigint', nullable: true })
  mediaCardBackId: number;

  @OneToOne(() => UserEntitiy, (user) => user.cardInfo, {
    onDelete: 'CASCADE',
    lazy: true,
  })
  @JoinColumn()
  user: UserEntitiy;
}
