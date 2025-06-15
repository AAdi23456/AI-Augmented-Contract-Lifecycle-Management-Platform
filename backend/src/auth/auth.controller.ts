import { Controller, Post, Body, Get, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('verify-token')
  async verifyToken(@Headers('authorization') token: string) {
    if (!token) {
      throw new Error('No token provided');
    }
    const tokenValue = token.replace('Bearer ', '');
    return this.authService.validateToken(tokenValue);
  }

  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  async getProfile(@Headers('authorization') token: string) {
    const tokenValue = token.replace('Bearer ', '');
    const decodedToken = await this.authService.validateToken(tokenValue);
    return this.authService.getUserById(decodedToken.uid);
  }

  @Post('create-user')
  async createUser(
    @Body() body: { email: string; password: string; role?: string },
  ) {
    const user = await this.authService.createUser(body.email, body.password);
    if (body.role) {
      await this.authService.updateUserRole(user.uid, body.role);
    }
    return user;
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('update-role')
  async updateRole(@Body() body: { uid: string; role: string }) {
    return this.authService.updateUserRole(body.uid, body.role);
  }
} 