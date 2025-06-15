import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Contract } from './contract.entity';

@Entity('contract_versions')
export class ContractVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  contractId: string;

  @Column()
  fileUrl: string;

  @Column({ nullable: true })
  versionNumber: number;

  @Column({ nullable: true })
  versionName: string;

  @Column({ nullable: true })
  description: string;

  @ManyToOne(() => Contract, (contract) => contract.versions)
  @JoinColumn({ name: 'contractId' })
  contract: Contract;

  @CreateDateColumn()
  createdAt: Date;
} 