import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from './user.model';
import { ContractVersion } from './contract-version.model';
import { Clause } from './clause.model';
import { Comment } from './comment.model';
import { ContractSummary } from './contract-summary.model';
import { Reminder } from './reminder.model';
import { ActivityLog } from './activity-log.model';

export enum ContractStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  SIGNED = 'SIGNED',
  EXPIRED = 'EXPIRED',
}

@Table({
  tableName: 'contracts',
  timestamps: true,
})
export class Contract extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.ENUM(...Object.values(ContractStatus)),
    allowNull: false,
    defaultValue: ContractStatus.DRAFT,
  })
  status: ContractStatus;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  createdById: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  uploadedFileUrl: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiryDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  effectiveDate: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  parties: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentTerms: string;

  @BelongsTo(() => User, 'createdById')
  createdBy: User;

  @HasMany(() => ContractVersion, 'contractId')
  versions: ContractVersion[];

  @HasMany(() => Clause, 'contractId')
  clauses: Clause[];

  @HasMany(() => Comment, 'contractId')
  comments: Comment[];

  @HasMany(() => ContractSummary, 'contractId')
  summaries: ContractSummary[];

  @HasMany(() => Reminder, 'contractId')
  reminders: Reminder[];

  @HasMany(() => ActivityLog, 'contractId')
  activityLogs: ActivityLog[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 