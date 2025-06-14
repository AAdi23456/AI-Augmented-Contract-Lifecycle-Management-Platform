import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Contract } from '../database/models/contract.model';
import { ContractVersion } from '../database/models/contract-version.model';
import { ContractStatus } from '../database/models/contract.model';

@Injectable()
export class ContractsService {
  constructor(
    @Inject('CONTRACT_REPOSITORY') private contractRepository: typeof Contract,
    @Inject('CONTRACT_VERSION_REPOSITORY') private contractVersionRepository: typeof ContractVersion,
  ) {}

  async findAll(userId: string) {
    return this.contractRepository.findAll({
      where: {
        createdById: userId,
      },
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string, userId: string) {
    const contract = await this.contractRepository.findByPk(id, {
      include: [{ model: ContractVersion }],
    });

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Check if the user has access to this contract
    // In a real app, you might have more complex permissions logic
    if (contract.createdById !== userId) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    return contract;
  }

  async create(createContractDto: any, userId: string) {
    const { title, uploadedFileUrl, fileName, fileType, fileSize } = createContractDto;

    // Create new contract
    const contract = await this.contractRepository.create({
      title,
      status: ContractStatus.DRAFT,
      createdById: userId,
      uploadedFileUrl,
    });

    // Create initial version
    await this.contractVersionRepository.create({
      contractId: contract.id,
      fileUrl: uploadedFileUrl,
      fileName,
      fileType,
      fileSize,
      versionNumber: 1,
    });

    return contract;
  }

  async uploadNewVersion(id: string, versionDto: any, userId: string) {
    const { fileUrl, fileName, fileType, fileSize } = versionDto;

    const contract = await this.findOne(id, userId);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Count existing versions to determine next version number
    const versionsCount = await this.contractVersionRepository.count({
      where: { contractId: id },
    });

    // Create new version
    const newVersion = await this.contractVersionRepository.create({
      contractId: id,
      fileUrl,
      fileName,
      fileType,
      fileSize,
      versionNumber: versionsCount + 1,
    });

    // Update contract's main file URL to the latest version
    await contract.update({
      uploadedFileUrl: fileUrl,
    });

    return newVersion;
  }

  async updateStatus(id: string, statusDto: { status: ContractStatus }, userId: string) {
    const contract = await this.findOne(id, userId);

    if (!contract) {
      throw new NotFoundException(`Contract with ID ${id} not found`);
    }

    // Validate status transition
    const { status } = statusDto;
    if (!Object.values(ContractStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return contract.update({ status });
  }
} 