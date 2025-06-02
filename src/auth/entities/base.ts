import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
@Entity() 
export abstract class BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn({ 
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP', 
     })
    createdAt: Date;

    @UpdateDateColumn({ 
        type: 'timestamp' 
        , default: () => 'CURRENT_TIMESTAMP',
     })
    updatedAt: Date;

    @DeleteDateColumn({ 
        type: 'timestamp', 
     })
    deletedAt?: Date;
    @Column({ default: true })
    createdBy: number;
    @Column({ default: true })
    updatedBy: number;
    @Column({ default: true })
    deletedBy?: number;
}