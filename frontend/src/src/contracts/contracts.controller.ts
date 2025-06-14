import { Controller, Get, Post, Body, Param, UseGuards, Request, Put } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { AuthGuard } from '../auth/guards/auth.guard';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(@Request() req) {
    const userId = req.user.id;
    return this.contractsService.findAll(userId);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    const userId = req.user.id;
    return this.contractsService.findOne(id, userId);
  }

  @UseGuards(AuthGuard)
  @Post()
  async create(@Body() createContractDto: any, @Request() req) {
    const userId = req.user.id;
    return this.contractsService.create(createContractDto, userId);
  }

  @UseGuards(AuthGuard)
  @Post('upload')
  async handleFileMetadata(@Body() fileMetadataDto: any, @Request() req) {
    // This endpoint is called from the frontend after Firebase upload succeeds
    // It just returns the metadata that was sent, to be saved in the contract creation flow
    return {
      success: true,
      data: fileMetadataDto,
    };
  }

  @UseGuards(AuthGuard)
  @Post(':id/versions')
  async uploadNewVersion(
    @Param('id') id: string,
    @Body() versionDto: any,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.contractsService.uploadNewVersion(id, versionDto, userId);
  }

  @UseGuards(AuthGuard)
  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() statusDto: any,
    @Request() req,
  ) {
    const userId = req.user.id;
    return this.contractsService.updateStatus(id, statusDto, userId);
  }
} 