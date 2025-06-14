import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { FirebaseModule } from '../firebase/firebase.module';
import { userProviders } from '../database/repositories/user.repository';

@Module({
  imports: [FirebaseModule],
  providers: [
    AuthService,
    ...userProviders
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {} 