import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  fileUrl: string;

  @IsString()
  fileType: string;

  @IsNumber()
  fileSize: number;

  @IsArray()
  @IsOptional()
  tags?: string[];
} 