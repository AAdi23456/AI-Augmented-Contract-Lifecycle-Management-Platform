import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { join } from 'path';
import * as fs from 'fs';

const serviceAccountPath = join(__dirname, '..', '..', 'help-desk-95816-firebase-adminsdk-fbsvc-127f7f8278.json');
const serviceAccount: ServiceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

let firebaseApp: admin.app.App | undefined;

export const initializeFirebaseAdmin = () => {
  try {
    if (!firebaseApp) {
      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
    console.log('Firebase Admin SDK initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
};

export const getFirebaseAdmin = () => {
  if (!firebaseApp) {
    firebaseApp = initializeFirebaseAdmin();
  }
  return firebaseApp;
}; 