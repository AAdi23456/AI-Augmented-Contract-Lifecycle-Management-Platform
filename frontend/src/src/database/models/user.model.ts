import { Table, Column, Model, DataType, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Contract } from './contract.model';
import { Comment } from './comment.model';
import { Reminder } from './reminder.model';
import { ActivityLog } from './activity-log.model';

export enum UserRole {
  ADMIN = 'ADMIN',
  LEGAL = 'LEGAL',
  VIEWER = 'VIEWER',
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    defaultValue: UserRole.VIEWER,
  })
  role: UserRole;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orgId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  firebaseUid: string;

  @HasMany(() => Contract, 'createdById')
  contracts: Contract[];

  @HasMany(() => Comment, 'userId')
  comments: Comment[];

  @HasMany(() => Reminder, 'userId')
  reminders: Reminder[];

  @HasMany(() => ActivityLog, 'actorId')
  activityLogs: ActivityLog[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
} 