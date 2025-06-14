import { Module } from '@nestjs/common';
import { ContractsController } from './contracts.controller';
import { ContractsService } from './contracts.service';
import { contractProviders } from '../database/repositories/contract.repository';
import { contractVersionProviders } from '../database/repositories/contract-version.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ContractsController],
  providers: [
    ContractsService,
    ...contractProviders,
    ...contractVersionProviders,
  ],
  exports: [ContractsService],
})
export class ContractsModule {} 