import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('documents')
@UseGuards(FirebaseAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  create(@Body() createDocumentDto: CreateDocumentDto, @User('uid') userId: string) {
    return this.documentsService.create(createDocumentDto, userId);
  }

  @Get()
  findAll(
    @User('uid') userId: string,
    @Query('status') status?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
  ) {
    return this.documentsService.findAll(userId, status, tag, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }

  @Post('extract-text')
  extractText(@Body('fileUrl') fileUrl: string) {
    return this.documentsService.extractText(fileUrl);
  }

  @Post(':id/summarize')
  generateSummary(@Param('id') id: string, @Body('text') text: string) {
    return this.documentsService.generateSummary(id, text);
  }
} 