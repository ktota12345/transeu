// src/auth/auth.controller.ts

import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth') // Główna ścieżka dla endpointów autoryzacji
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login') // Endpoint logowania
  async login(@Body() loginDto: { email: string, password: string }) {
    return this.authService.login(loginDto.email, loginDto.password);
  }

  @Post('reset-token') // Endpoint generowania tokenu resetowania hasła
  async generateResetToken(@Body() body: { email: string }) {
    return this.authService.generateResetToken(body.email);
  }

  @Post('reset-password') // Endpoint resetowania hasła
  async resetPassword(@Body() body: { token: string, newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }
}
