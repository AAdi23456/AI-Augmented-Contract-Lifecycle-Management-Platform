import { Controller, Post, Body, Get, Put, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserRole } from '../database/models/user.model';
import { FirebaseAuthGuard } from '../firebase/auth.guard';

// DTO for registering a user with Firebase token
class RegisterUserDto {
  idToken: string;
}

// DTO for updating a user's role
class UpdateRoleDto {
  role: UserRole;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    try {
      const decodedToken = await this.authService.verifyToken(registerUserDto.idToken);
      const user = await this.authService.registerUser({
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email.split('@')[0],
      });
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or registration failed');
    }
  }

  @Get('me')
  @UseGuards(FirebaseAuthGuard)
  async getProfile(@Request() req) {
    const user = await this.authService.getUserByFirebaseUid(req.user.uid);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  @Put('users/:userId/role')
  @UseGuards(FirebaseAuthGuard)
  async updateRole(
    @Request() req,
    @Param('userId') userId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    // Check if the requesting user is an admin
    const requestingUser = await this.authService.getUserByFirebaseUid(req.user.uid);
    if (!requestingUser || requestingUser.role !== UserRole.ADMIN) {
      throw new UnauthorizedException('Only admins can update user roles');
    }

    return this.authService.updateUserRole(userId, updateRoleDto.role);
  }
} 