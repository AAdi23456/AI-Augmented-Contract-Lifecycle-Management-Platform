import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { Inject } from '@nestjs/common';
import { User } from '../database/models/user.model';
import { UserRole } from '../database/models/user.model';

@Injectable()
export class AuthService {
  constructor(
    private readonly firebaseService: FirebaseService,
    @Inject('USER_REPOSITORY') private userRepository: typeof User,
  ) {}

  async verifyToken(token: string) {
    try {
      return await this.firebaseService.verifyIdToken(token);
    } catch (error) {
      throw new InternalServerErrorException('Failed to verify token', error.message);
    }
  }

  async registerUser(firebaseUser: any) {
    try {
      const [user, created] = await this.userRepository.findOrCreate({
        where: { email: firebaseUser.email },
        defaults: {
          name: firebaseUser.name || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role: UserRole.VIEWER, // Default role for new users
          firebaseUid: firebaseUser.uid,
        },
      });

      // If user exists but firebaseUid is not set, update it
      if (!created && !user.firebaseUid) {
        user.firebaseUid = firebaseUser.uid;
        await user.save();
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to register user', error.message);
    }
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }

  async getUserByFirebaseUid(uid: string) {
    return this.userRepository.findOne({ where: { firebaseUid: uid } });
  }

  async updateUserRole(userId: string, role: UserRole) {
    try {
      const user = await this.userRepository.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      user.role = role;
      await user.save();
      
      return user;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user role', error.message);
    }
  }
} 