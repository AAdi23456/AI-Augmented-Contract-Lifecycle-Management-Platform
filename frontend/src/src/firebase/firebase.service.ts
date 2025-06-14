import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebase from 'firebase/app';
import * as admin from 'firebase-admin';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private firebaseApp: firebase.FirebaseApp;
  private adminApp: admin.app.App;
  
  onModuleInit() {
    // Initialize Firebase client SDK
    this.firebaseApp = firebase.initializeApp({
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
      measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    });
    
    // Initialize Firebase admin SDK
    this.adminApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escape sequences for newlines in the private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
    
    console.log('Firebase initialized successfully');
  }
  
  // Get Firebase Auth instance
  getAuth() {
    return getAuth(this.firebaseApp);
  }
  
  // Get Firebase Admin Auth instance
  getAdminAuth() {
    return this.adminApp.auth();
  }
  
  // Get Firebase Storage instance
  getStorage() {
    return getStorage(this.firebaseApp);
  }
  
  // Get Firebase Admin Storage instance
  getAdminStorage() {
    return this.adminApp.storage();
  }
  
  // Verify ID token
  async verifyIdToken(token: string) {
    try {
      return await this.adminApp.auth().verifyIdToken(token);
    } catch (error) {
      throw new Error('Invalid token: ' + error.message);
    }
  }
} 