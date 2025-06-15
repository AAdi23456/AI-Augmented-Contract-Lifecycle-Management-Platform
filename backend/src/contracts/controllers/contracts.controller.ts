import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ContractsService } from '../contracts.service';
import { CreateContractDto } from '../dto/create-contract.dto';
import { Contract, ContractStatus } from '../entities/contract.entity';
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';
import { User } from '../../auth/user.decorator';

@Controller('contracts')
@UseGuards(FirebaseAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  // ... existing endpoints ...

  @Post(':id/summarize')
  generateSummary(
    @Param('id') id: string,
    @Body('text') text: string,
  ): Promise<Contract> {
    return this.contractsService.generateSummary(id, text);
  }
} 