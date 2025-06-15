import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as admin from 'firebase-admin';
import { getFirebaseAdmin } from './firebase.service';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];
    if (!idToken) {
      throw new UnauthorizedException('Missing ID token');
    }

    try {
      // Get Firebase Admin instance
      const firebaseAdmin = getFirebaseAdmin();
      
      // Verify the ID token
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
      
      // Attach the user to the request
      request.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        role: decodedToken.role || 'user',
      };
      
      return true;
    } catch (error) {
      console.error('Firebase auth error:', error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
} 