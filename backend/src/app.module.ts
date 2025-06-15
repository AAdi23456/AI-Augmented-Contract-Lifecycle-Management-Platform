import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ContractsModule } from './contracts/contracts.module';
import { Contract } from './contracts/entities/contract.entity';
import { ContractVersion } from './contracts/entities/contract-version.entity';
import { AiModule } from './ai/ai.module';
import { DocumentsModule } from './documents/documents.module';
import { Document } from './documents/entities/document.entity';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        // Check if PostgreSQL configuration is provided
        const usePostgres = configService.get<string>('USE_POSTGRES') === 'true';
        
        // Use SQLite for development by default
        if (!usePostgres) {
          console.log('Using SQLite database for development');
          return {
            type: 'sqlite',
            database: ':memory:', // In-memory database for development
            entities: [Contract, ContractVersion, Document],
            synchronize: true,
            logging: true,
          };
        }
        
        // Otherwise use PostgreSQL with provided config
        console.log('Using PostgreSQL database');
        return {
          type: 'postgres',
          host: configService.get('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get('DB_USERNAME', 'postgres'),
          password: configService.get('DB_PASSWORD', 'postgres'),
          database: configService.get('DB_NAME', 'hr_helpdesk'),
          entities: [Contract, ContractVersion, Document],
          synchronize: configService.get<boolean>('DB_SYNC', true),
        };
      },
    }),
    AuthModule,
    ContractsModule,
    AiModule,
    DocumentsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
