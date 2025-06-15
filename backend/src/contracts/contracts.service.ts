import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contract, ContractStatus } from './entities/contract.entity';
import { ContractVersion } from './entities/contract-version.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { OpenAiService } from '../ai/openai.service';

@Injectable()
export class ContractsService {
  constructor(
    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,
    @InjectRepository(ContractVersion)
    private contractVersionRepository: Repository<ContractVersion>,
    private openAiService: OpenAiService,
  ) {}

  async create(createContractDto: CreateContractDto, userId: string): Promise<Contract> {
    try {
      console.log('Creating contract with DTO:', createContractDto);
      
      // Create a new contract
      const contract = this.contractRepository.create({
        ...createContractDto,
        userId,
        status: createContractDto.status || ContractStatus.DRAFT,
        // Ensure we store extracted text and summary if provided
        extractedText: createContractDto.extractedText,
        summary: createContractDto.summary,
      });
      
      console.log('Contract entity created:', contract);

      // Save the contract to get an ID
      const savedContract = await this.contractRepository.save(contract);
      console.log('Contract saved with ID:', savedContract.id);

      // Create the first version
      const contractVersion = this.contractVersionRepository.create({
        contractId: savedContract.id,
        fileUrl: createContractDto.fileUrl,
        versionNumber: 1,
        versionName: 'Initial Version',
      });

      // Save the version
      await this.contractVersionRepository.save(contractVersion);
      console.log('Contract version saved');

      // Return the contract with its version
      return this.findOne(savedContract.id);
    } catch (error) {
      console.error('Error creating contract:', error);
      throw error;
    }
  }

  async findAll(userId: string): Promise<Contract[]> {
    return this.contractRepository.find({
      where: { userId },
      relations: ['versions'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Contract> {
    const contract = await this.contractRepository.findOne({
      where: { id },
      relations: ['versions'],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async addVersion(
    contractId: string,
    fileUrl: string,
    versionName?: string,
    description?: string,
  ): Promise<ContractVersion> {
    // Find the contract
    const contract = await this.findOne(contractId);

    // Get the latest version number
    const latestVersion = await this.contractVersionRepository.findOne({
      where: { contractId },
      order: { versionNumber: 'DESC' },
    });

    const versionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;

    // Create a new version
    const contractVersion = this.contractVersionRepository.create({
      contractId,
      fileUrl,
      versionNumber,
      versionName: versionName || `Version ${versionNumber}`,
      description,
    });

    // Save the version
    return this.contractVersionRepository.save(contractVersion);
  }

  async updateStatus(id: string, status: ContractStatus): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.status = status;
    return this.contractRepository.save(contract);
  }

  async updateSummary(id: string, summary: string): Promise<Contract> {
    const contract = await this.findOne(id);
    contract.summary = summary;
    return this.contractRepository.save(contract);
  }

  async generateSummary(id: string, text: string): Promise<Contract> {
    const contract = await this.findOne(id);
    
    try {
      // Generate summary using OpenAI
      const summary = await this.openAiService.summarizeContract(text);
      
      // Update contract with summary
      contract.summary = summary;
      return this.contractRepository.save(contract);
    } catch (error) {
      console.error('Summary generation error:', error);
      throw new Error('Failed to generate summary');
    }
  }

  async update(id: string, updateData: Partial<Contract>): Promise<Contract> {
    const contract = await this.findOne(id);
    
    // Update the contract with the provided data
    Object.assign(contract, updateData);
    
    // Save the updated contract
    return this.contractRepository.save(contract);
  }
} 