import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentStatus } from './entities/document.entity';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { StorageService } from '../storage/storage.service';
import * as textract from 'textract';
import * as util from 'util';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private documentsRepository: Repository<Document>,
    private storageService: StorageService,
  ) {}

  async create(createDocumentDto: CreateDocumentDto, userId: string): Promise<Document> {
    const document = this.documentsRepository.create({
      ...createDocumentDto,
      uploadedBy: userId,
      status: DocumentStatus.PENDING,
    });
    
    return this.documentsRepository.save(document);
  }

  async findAll(
    userId: string,
    status?: string,
    tag?: string,
    search?: string,
  ): Promise<Document[]> {
    const queryBuilder = this.documentsRepository.createQueryBuilder('document');
    
    queryBuilder.where('document.uploadedBy = :userId', { userId });
    
    if (status) {
      queryBuilder.andWhere('document.status = :status', { status });
    }
    
    if (tag) {
      queryBuilder.andWhere(':tag = ANY(document.tags)', { tag });
    }
    
    if (search) {
      queryBuilder.andWhere(
        '(document.title ILIKE :search OR document.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }
    
    return queryBuilder.orderBy('document.uploadedAt', 'DESC').getMany();
  }

  async findOne(id: string): Promise<Document> {
    const document = await this.documentsRepository.findOne({ where: { id } });
    
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    
    return document;
  }

  async update(id: string, updateDocumentDto: UpdateDocumentDto): Promise<Document> {
    const document = await this.findOne(id);
    
    Object.assign(document, updateDocumentDto);
    
    return this.documentsRepository.save(document);
  }

  async remove(id: string): Promise<void> {
    const document = await this.findOne(id);
    
    if (document.fileUrl) {
      await this.storageService.deleteFile(document.fileUrl);
    }
    
    await this.documentsRepository.remove(document);
  }

  async extractText(fileUrl: string): Promise<string> {
    const downloadUrl = await this.storageService.getDownloadUrl(fileUrl);
    const extractTextAsync = util.promisify(textract.fromUrl);
    
    try {
      const text = await extractTextAsync(downloadUrl, {
        preserveLineBreaks: true,
      });
      return text;
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error('Failed to extract text from document');
    }
  }

  async generateSummary(id: string, text: string): Promise<Document> {
    const document = await this.findOne(id);
    
    // Here you would typically call an AI service to generate a summary
    // For now, let's create a simple summary (first 200 characters)
    const summary = text.length > 200 
      ? `${text.substring(0, 200)}...` 
      : text;
    
    document.extractedText = text;
    document.summary = summary;
    document.status = DocumentStatus.COMPLETED;
    
    return this.documentsRepository.save(document);
  }

  async processDocument(id: string): Promise<Document> {
    const document = await this.findOne(id);
    
    try {
      // Update status to processing
      document.status = DocumentStatus.PROCESSING;
      await this.documentsRepository.save(document);
      
      // Extract text from document
      const extractedText = await this.extractText(document.fileUrl);
      
      // Generate summary
      return this.generateSummary(id, extractedText);
    } catch (error) {
      // Update status to failed if there's an error
      document.status = DocumentStatus.FAILED;
      await this.documentsRepository.save(document);
      throw error;
    }
  }
} 