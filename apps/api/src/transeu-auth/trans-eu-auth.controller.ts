import { Controller, Get, Query, Res, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { TransEuAuthService } from './trans-eu-auth.service';
import { ConfigService } from '@nestjs/config';

@Controller('trans-eu/auth')
export class TransEuAuthController {
    constructor(
        private authService: TransEuAuthService,
        private config: ConfigService,
    ) {}

    @Get('redirect')
    redirectToAuth(@Res() res: Response) {
        const state = this.config.get('TRANSEU_STATE_PREFIX') + '_' + Math.random().toString(36).substring(10, 15);
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
}
