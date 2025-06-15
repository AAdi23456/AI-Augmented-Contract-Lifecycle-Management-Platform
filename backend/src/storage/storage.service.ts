import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { getFirebaseAdmin } from '../auth/firebase.service';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

@Injectable()
export class StorageService {
  private bucket: any;

  constructor(private configService: ConfigService) {
    try {
      // Get Firebase Admin instance
      const firebaseAdmin = getFirebaseAdmin();
      this.bucket = firebaseAdmin.storage().bucket();
    } catch (error) {
      console.warn('Firebase Storage not initialized:', error);
    }
  }

  /**
   * Get a download URL for a file in Firebase Storage
   * @param fileUrl The file URL or path in Firebase Storage
   * @returns A signed URL for downloading the file
   */
  async getDownloadUrl(fileUrl: string): Promise<string> {
    try {
      // If the URL is already a full URL, return it
      if (fileUrl.startsWith('http')) {
        return fileUrl;
      }

      // Extract the path from the URL if needed
      const filePath = fileUrl.startsWith('gs://') 
        ? fileUrl.split('/').slice(3).join('/') 
        : fileUrl;

      // Get a reference to the file
      const file = this.bucket.file(filePath);
      
      // Generate a signed URL that expires in 1 hour
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000, // 1 hour
      });
      
      return url;
    } catch (error) {
      console.error('Error getting download URL:', error);
      // Return the original URL if we couldn't get a signed URL
      return fileUrl;
    }
  }

  /**
   * Delete a file from Firebase Storage
   * @param fileUrl The file URL or path in Firebase Storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      // Extract the path from the URL if needed
      const filePath = fileUrl.startsWith('gs://') 
        ? fileUrl.split('/').slice(3).join('/') 
        : fileUrl;

      // Delete the file
      await this.bucket.file(filePath).delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Upload a file to Firebase Storage
   * @param file The file to upload
   * @param path Optional path to save the file to. If not provided, a random path will be generated.
   * @returns The file URL
   */
  async uploadFile(file: Buffer, path?: string): Promise<string> {
    try {
      // Generate a random path if not provided
      const filePath = path || `uploads/${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Upload the file
      const fileRef = this.bucket.file(filePath);
      await fileRef.save(file);
      
      // Make the file publicly readable
      await fileRef.makePublic();
      
      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${filePath}`;
      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  async uploadFileExpress(file: Express.Multer.File): Promise<{
    fileUrl: string;
    fileName: string;
    fileType: string;
    fileSize: number;
  }> {
    try {
      const fileName = `${Date.now()}-${file.originalname.replace(/\s/g, '_')}`;
      const filePath = path.join(os.tmpdir(), fileName);
      
      // Write file to temp directory
      fs.writeFileSync(filePath, file.buffer);
      
      // Upload to Firebase Storage
      const uploadResponse = await this.bucket.upload(filePath, {
        destination: `uploads/${fileName}`,
        metadata: {
          contentType: file.mimetype,
        },
      });
      
      // Make file publicly accessible
      await uploadResponse[0].makePublic();
      
      // Get public URL
      const fileUrl = uploadResponse[0].publicUrl();
      
      // Clean up temp file
      fs.unlinkSync(filePath);
      
      return {
        fileUrl,
        fileName: file.originalname,
        fileType: file.mimetype,
        fileSize: file.size,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }
} 