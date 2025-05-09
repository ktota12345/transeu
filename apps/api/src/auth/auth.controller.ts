// src/auth/auth.controller.ts

import {Controller, Post, Body} from '@nestjs/common';
import {AuthService} from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post('login')
    async login(@Body() loginDto: { email: string, password: string }) {
        return this.authService.login(loginDto.email, loginDto.password);
    }

    @Post('reset-token')
    async generateResetToken(@Body() body: { email: string }) {
        return this.authService.generateResetToken(body.email);
    }

    @Post('reset-password')
    async resetPassword(@Body() body: { token: string, newPassword: string }) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }

    @Post('refresh')
    async refresh(@Body() body: { refreshToken: string }) {
        return this.authService.refreshAccessToken(body.refreshToken);
    }

}
