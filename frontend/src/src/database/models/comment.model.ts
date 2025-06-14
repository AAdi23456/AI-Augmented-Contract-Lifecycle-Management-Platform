import { Table, Column, Model, DataType, ForeignKey, BelongsTo, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { User } from './user.model';
import { Contract } from './contract.model';
import { ContractVersion } from './contract-version.model';
import { Clause } from './clause.model';

@Table({
  tableName: 'comments',
  timestamps: true,
})
export class Comment extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  position: string;

  @ForeignKey(() => Contract)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  contractId: string;

  @ForeignKey(() => Clause)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  clauseId: string;

  @ForeignKey(() => ContractVersion)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  versionId: string;

  @BelongsTo(() => User, 'userId')
  user: User;

  @BelongsTo(() => Contract, 'contractId')
  contract: Contract;

  @BelongsTo(() => Clause, 'clauseId')
  clause: Clause;

  @BelongsTo(() => ContractVersion, 'versionId')
  version: ContractVersion;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 