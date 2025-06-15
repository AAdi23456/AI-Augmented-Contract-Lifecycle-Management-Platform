import { Injectable, UnauthorizedException } from '@nestjs/common';
import { getFirebaseAdmin } from '../config/firebase.config';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthService {
  private getAuth() {
    return getFirebaseAdmin().auth();
  }

  async validateToken(token: string): Promise<admin.auth.DecodedIdToken> {
    try {
      const decodedToken = await this.getAuth().verifyIdToken(token);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async getUserById(uid: string): Promise<admin.auth.UserRecord> {
    try {
      const user = await this.getAuth().getUser(uid);
      return user;
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  async createUser(email: string, password: string): Promise<admin.auth.UserRecord> {
    try {
      const user = await this.getAuth().createUser({
        email,
        password,
        emailVerified: false,
      });
      return user;
    } catch (error) {
      throw new Error('Failed to create user');
    }
  }

  async updateUserRole(uid: string, role: string): Promise<void> {
    try {
      await this.getAuth().setCustomUserClaims(uid, { role });
    } catch (error) {
      throw new Error('Failed to update user role');
    }
  }
} 