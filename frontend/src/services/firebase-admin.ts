// This file should only be imported in server components or API routes
import { serviceAccountConfig } from '@/config/firebase-config';

// This conditional ensures Firebase Admin SDK is only used on the server
if (typeof window !== 'undefined') {
  throw new Error('This module should only be used on the server side');
}

// Dynamically import Firebase Admin SDK
let admin: any;
let cert: any;
let getApps: any;
let getStorage: any;
let getFirestore: any;
let getAuth: any;

// These imports will only happen on the server
async function importAdminSDK() {
  if (!admin) {
    const adminModule = await import('firebase-admin/app');
    admin = adminModule.initializeApp;
    cert = adminModule.cert;
    getApps = adminModule.getApps;
    
    const storageModule = await import('firebase-admin/storage');
    getStorage = storageModule.getStorage;
    
    const firestoreModule = await import('firebase-admin/firestore');
    getFirestore = firestoreModule.getFirestore;
    
    const authModule = await import('firebase-admin/auth');
    getAuth = authModule.getAuth;
  }
}

// Initialize Firebase Admin SDK
let firebaseAdmin: any;
let adminAuth: any;
let adminFirestore: any;
let adminStorage: any;

// Export an async function to initialize the admin SDK
export async function initializeAdminSDK() {
  await importAdminSDK();
  
  const apps = getApps();
  if (apps.length === 0) {
    // Check if we have the required credentials
    if (!serviceAccountConfig.privateKey) {
      console.warn('Firebase Admin SDK private key is not set. Some server-side features will not work.');
      return false;
    }
    
    try {
      firebaseAdmin = admin({
        credential: cert({
          projectId: serviceAccountConfig.projectId,
          clientEmail: serviceAccountConfig.clientEmail,
          privateKey: serviceAccountConfig.privateKey,
        }),
        storageBucket: `${serviceAccountConfig.projectId}.appspot.com`
      });
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
      return false;
    }
  } else {
    firebaseAdmin = apps[0];
  }
  
  // Initialize services
  adminAuth = getAuth(firebaseAdmin);
  adminFirestore = getFirestore(firebaseAdmin);
  adminStorage = getStorage(firebaseAdmin);
  
  return true;
}

/**
 * Verify a Firebase ID token and get the user
 * @param idToken The Firebase ID token to verify
 * @returns The decoded token with user information
 */
export async function verifyIdToken(idToken: string) {
  await initializeAdminSDK();
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    return await adminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Unauthorized');
  }
}

/**
 * Get a signed URL for a file in Firebase Storage
 * @param filePath The path to the file in Firebase Storage
 * @param expiresIn The expiration time in seconds (default: 1 hour)
 * @returns A signed URL for the file
 */
export async function getSignedUrl(filePath: string, expiresIn = 3600) {
  await initializeAdminSDK();
  if (!adminStorage) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    const bucket = adminStorage.bucket();
    const file = bucket.file(filePath);
    
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expiresIn * 1000,
    });
    
    return url;
  } catch (error) {
    console.error('Error getting signed URL:', error);
    throw error;
  }
}

/**
 * Create a custom token for a user
 * @param uid The user ID to create a token for
 * @param claims Additional claims to include in the token
 * @returns A custom token for the user
 */
export async function createCustomToken(uid: string, claims?: Record<string, any>) {
  await initializeAdminSDK();
  if (!adminAuth) {
    throw new Error('Firebase Admin SDK not initialized');
  }
  
  try {
    return await adminAuth.createCustomToken(uid, claims);
  } catch (error) {
    console.error('Error creating custom token:', error);
    throw error;
  }
}

// Export admin services for use in API routes
export { adminAuth, adminFirestore, adminStorage }; 