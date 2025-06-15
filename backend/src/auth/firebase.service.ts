import { Injectable, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

// Singleton instance of Firebase Admin
let firebaseAdmin: admin.app.App;

@Injectable()
export class FirebaseService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.initializeFirebaseAdmin();
  }

  private initializeFirebaseAdmin() {
    if (!firebaseAdmin) {
      // Check if we already have apps initialized
      const apps = admin.apps;
      if (apps.length === 0) {
        try {
          // Get Firebase config from environment variables
          const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
          const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
          const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n');
          const mockEnabled = this.configService.get<string>('ENABLE_FIREBASE_MOCK') === 'true';
          
          // For development, initialize with mock if enabled or credentials not available
          if (mockEnabled || !projectId || !clientEmail || !privateKey) {
            console.warn('Firebase credentials are not complete or mock is enabled. Using mock for development.');
            
            // Initialize with a minimal config for development
            firebaseAdmin = admin.initializeApp({
              projectId: this.configService.get<string>('MOCK_FIREBASE_PROJECT_ID') || 'mock-project-id',
            });
            console.log('Firebase Admin initialized with mock configuration for development');
          } else {
            // Initialize with service account
            firebaseAdmin = admin.initializeApp({
              credential: admin.credential.cert({
                projectId,
                clientEmail,
                privateKey,
              }),
              storageBucket: `${projectId}.appspot.com`,
            });
            console.log('Firebase Admin initialized with service account');
          }
        } catch (error) {
          console.error('Error initializing Firebase Admin:', error);
          // Fallback to mock Firebase app with minimal config
          try {
            firebaseAdmin = admin.initializeApp({
              projectId: this.configService.get<string>('MOCK_FIREBASE_PROJECT_ID') || 'mock-project-id',
            });
            console.log('Firebase Admin initialized with mock configuration after error');
          } catch (fallbackError) {
            console.error('Failed to initialize even mock Firebase Admin:', fallbackError);
          }
        }
      } else {
        // Use the existing app
        firebaseAdmin = admin.app();
      }
    }
  }

  getFirebaseAdmin() {
    if (!firebaseAdmin) {
      this.initializeFirebaseAdmin();
    }
    return firebaseAdmin;
  }
}

// Export a function to get the Firebase Admin instance from anywhere
export function getFirebaseAdmin(): admin.app.App {
  if (!firebaseAdmin) {
    console.warn('Firebase Admin SDK not initialized, returning a mock instance');
    // Return a mock instance for development
    return {
      auth: () => ({
        verifyIdToken: (token: string) => Promise.resolve({ 
          uid: process.env.MOCK_FIREBASE_USER_ID || 'mock-user-id', 
          email: process.env.MOCK_FIREBASE_USER_EMAIL || 'mock@example.com' 
        }),
      }),
      storage: () => ({
        bucket: () => ({
          file: (path: string) => ({
            save: () => Promise.resolve(),
            makePublic: () => Promise.resolve(),
            getSignedUrl: () => Promise.resolve([process.env.MOCK_FIREBASE_STORAGE_URL || 'https://example.com/mock-file']),
            delete: () => Promise.resolve(),
          }),
          name: process.env.MOCK_FIREBASE_BUCKET_NAME || 'mock-bucket',
        }),
      }),
    } as any;
  }
  return firebaseAdmin;
}