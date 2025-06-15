import { Controller, Post, UseInterceptors, UploadedFile, Get, Query, Delete, UseGuards, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { User } from '../auth/user.decorator';

@Controller('storage')
@UseGuards(FirebaseAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('path') customPath?: string,
    @User('uid') userId?: string
  ) {
    // Generate a path based on user ID if available
    const path = customPath || (userId ? `uploads/${userId}/${Date.now()}-${file.originalname}` : undefined);
    
    // Upload the file buffer with the generated path
    const fileUrl = await this.storageService.uploadFile(file.buffer, path);
    
    return { 
      fileUrl,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    };
  }

  @Get('download-url')
  async getDownloadUrl(@Query('fileUrl') fileUrl: string) {
    const downloadUrl = await this.storageService.getDownloadUrl(fileUrl);
    return { downloadUrl };
  }

  @Delete('delete')
  async deleteFile(@Query('fileUrl') fileUrl: string) {
    await this.storageService.deleteFile(fileUrl);
    return { success: true };
  }
} 