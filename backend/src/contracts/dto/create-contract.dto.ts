import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDate, IsEnum } from 'class-validator';
import { ContractStatus } from '../entities/contract.entity';

export class CreateContractDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsString()
  originalFilename: string;

  @IsNotEmpty()
  @IsString()
  fileUrl: string;

  @IsNotEmpty()
  @IsString()
  fileType: string;

  @IsNotEmpty()
  @IsNumber()
  fileSize: number;

  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsDate()
  @IsOptional()
  expiryDate?: Date;

  @IsString()
  @IsOptional()
  summary?: string;

  @IsString()
  @IsOptional()
  extractedText?: string;
} 