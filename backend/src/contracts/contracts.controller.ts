import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { Contract, ContractStatus } from './entities/contract.entity';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('contracts')
@UseGuards(FirebaseAuthGuard)
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  create(@Body() createContractDto: CreateContractDto, @User('uid') userId: string): Promise<Contract> {
    return this.contractsService.create(createContractDto, userId);
  }

  @Get()
  findAll(@User('uid') userId: string): Promise<Contract[]> {
    return this.contractsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Contract> {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: ContractStatus,
  ): Promise<Contract> {
    return this.contractsService.updateStatus(id, status);
  }

  @Patch(':id/summary')
  updateSummary(
    @Param('id') id: string,
    @Body('summary') summary: string,
  ): Promise<Contract> {
    return this.contractsService.updateSummary(id, summary);
  }

  @Post(':id/summarize')
  generateSummary(
    @Param('id') id: string,
    @Body('text') text: string,
  ): Promise<Contract> {
    return this.contractsService.generateSummary(id, text);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateData: Partial<Contract>,
  ): Promise<Contract> {
    return this.contractsService.update(id, updateData);
  }

  @Post(':id/versions')
  addVersion(
    @Param('id') id: string,
    @Body() body: { fileUrl: string; versionName?: string; description?: string },
  ) {
    return this.contractsService.addVersion(
      id,
      body.fileUrl,
      body.versionName,
      body.description,
    );
  }
} 