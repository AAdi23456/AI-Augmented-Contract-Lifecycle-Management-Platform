import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ContractVersion } from './contract-version.entity';

export enum ContractStatus {
  DRAFT = 'Draft',
  REVIEW = 'Review',
  SIGNED = 'Signed',
  EXPIRED = 'Expired',
}

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  userId: string;

  @Column()
  originalFilename: string;

  @Column()
  fileUrl: string;

  @Column()
  fileType: string;

  @Column('bigint')
  fileSize: number;

  @Column({
    type: 'varchar',
    default: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @Column({ nullable: true })
  expiryDate: Date;

  @Column({ nullable: true, type: 'text' })
  summary: string;

  @Column({ nullable: true, type: 'text' })
  extractedText: string;

  @OneToMany(() => ContractVersion, (version) => version.contract, { cascade: true })
  versions: ContractVersion[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 