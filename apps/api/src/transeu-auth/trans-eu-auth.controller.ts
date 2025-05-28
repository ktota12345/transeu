import {Controller, Get, Query, Res, Post, Body, HttpException} from '@nestjs/common';
import {Response} from 'express';
import {TransEuAuthService} from './trans-eu-auth.service';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '../prisma/prisma.service';

// trans-eu-auth.dto.ts
export class SaveTokenDto {
    accessToken: string;
    expiresAt: string; // ISO format string, np. "2025-05-28T15:00:00Z"
}

@Controller('trans-eu/auth')
export class TransEuAuthController {
    constructor(
        private authService: TransEuAuthService,
        private config: ConfigService,
        private prisma: PrismaService,
    ) {
    }

    @Get('redirect')
    redirectToAuth(@Res() res: Response) {
        const state = this.config.get('TRANSEU_STATE_PREFIX') + '_' + Math.random().toString(36).substring(0, 15);
        const params = new URLSearchParams({
            client_id: this.config.get('TRANSEU_CLIENT_ID') as string,
            response_type: 'code',
            state: state,
            redirect_uri: this.config.get('TRANSEU_REDIRECT_URI') as string,
        });


        const redirectUrl = `https://auth.platform.trans.eu/oauth2/auth?${params.toString()}`;
        res.redirect(redirectUrl);
    }

    @Get('callback')
    async handleCallback(@Query('code') code: string, @Res() res: Response) {
        if (!code) {
            throw new HttpException('Missing code in query', 400);
        }

        await this.authService.exchangeCodeForToken(code);

        res.send('Token successfully obtained and saved.');
    }

    @Post('token')
    async saveToken(@Body() body: SaveTokenDto) {
        const {accessToken, expiresAt} = body;

        // Czy istnieje token w bazie?
        const existing = await this.prisma.transEuAppToken.findFirst();

        if (existing) {
            await this.prisma.transEuAppToken.update({
                where: {id: existing.id},
                data: {
                    accessToken,
                    expiresAt: new Date(expiresAt),
                },
            });
        } else {
            await this.prisma.transEuAppToken.create({
                data: {
                    accessToken,
                    expiresAt: new Date(expiresAt),
                },
            });
        }

        return {success: true, message: 'Token zapisany.'};
    }
}
