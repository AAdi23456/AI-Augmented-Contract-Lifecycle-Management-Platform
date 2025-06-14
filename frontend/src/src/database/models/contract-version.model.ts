import { Table, Column, Model, DataType, ForeignKey, BelongsTo, HasMany, CreatedAt } from 'sequelize-typescript';
import { Contract } from './contract.model';
import { Comment } from './comment.model';

@Table({
  tableName: 'contract_versions',
  timestamps: true,
  updatedAt: false,
})
export class ContractVersion extends Model {
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
  fileUrl: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fileName: string;
  
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  fileType: string;
  
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  fileSize: number;
  
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 1,
  })
  versionNumber: number;

  @BelongsTo(() => Contract, 'contractId')
  contract: Contract;

  @HasMany(() => Comment, 'versionId')
  comments: Comment[];

  @CreatedAt
  createdAt: Date;
} 