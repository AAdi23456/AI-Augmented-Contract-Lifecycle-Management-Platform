import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Contract } from './contract.model';
import { Comment } from './comment.model';

export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

@Table({
  tableName: 'clauses',
  timestamps: true,
})
export class Clause extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Contract)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  contractId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @Column({
    type: DataType.ENUM(...Object.values(RiskLevel)),
    allowNull: false,
    defaultValue: RiskLevel.LOW,
  })
  riskScore: RiskLevel;

  @BelongsTo(() => Contract, 'contractId')
  contract: Contract;

  @HasMany(() => Comment, 'clauseId')
  comments: Comment[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 