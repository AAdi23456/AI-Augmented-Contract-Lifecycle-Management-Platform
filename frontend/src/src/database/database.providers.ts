import { Sequelize } from 'sequelize-typescript';
import { ConfigService } from '@nestjs/config';
import { User } from './models/user.model';
import { Contract } from './models/contract.model';
import { ContractVersion } from './models/contract-version.model';
import { Clause } from './models/clause.model';
import { Comment } from './models/comment.model';
import { ContractSummary } from './models/contract-summary.model';
import { Reminder } from './models/reminder.model';
import { ActivityLog } from './models/activity-log.model';

export const databaseProviders = [
  {
    provide: 'SEQUELIZE',
    useFactory: async (configService: ConfigService) => {
      const sequelize = new Sequelize({
        dialect: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'password'),
        database: configService.get('DB_NAME', 'clm_platform'),
        logging: configService.get('NODE_ENV') !== 'production',
      });

      // Register models
      sequelize.addModels([
        User,
        Contract,
        ContractVersion,
        Clause,
        Comment,
        ContractSummary,
        Reminder,
        ActivityLog,
      ]);

      // Sync database (in production, use migrations instead)
      if (configService.get('NODE_ENV') !== 'production') {
        await sequelize.sync({ alter: true });
      }

      return sequelize;
    },
    inject: [ConfigService],
  },
]; 