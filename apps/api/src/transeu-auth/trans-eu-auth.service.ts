import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as dayjs from 'dayjs';

@Injectable()
export class TransEuAuthService {
    constructor(
        private prisma: PrismaService,
        private config: ConfigService,
    ) {}

    async exchangeCodeForToken(code: string) {
        const url = 'https://api.platform.trans.eu/ext/auth-api/accounts/token';
        const data = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: this.config.get('TRANSEU_REDIRECT_URI') as string,
            client_id: this.config.get('TRANSEU_CLIENT_ID') as string,
            client_secret: this.config.get('TRANSEU_CLIENT_SECRET') as string,
        });

        try {
            const response = await axios.post(url, data.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-key': this.config.get('TRANSEU_API_KEY'),
                },
            });

            const { access_token, token_type, expires_in, refresh_token } = response.data;

            const expiresAt = dayjs().add(expires_in, 'second').toDate();

            await this.prisma.transEuToken.deleteMany({});
            await this.prisma.transEuToken.create({
                data: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    tokenType: token_type,
                    expiresAt,
                },
            });

            return access_token;
        } catch (error) {
            throw new HttpException('Token exchange failed', 500);
        }
    }

    async refreshToken(): Promise<string> {
        const tokenRecord = await this.prisma.transEuToken.findFirst();

        if (!tokenRecord || !tokenRecord.refreshToken) {
            throw new HttpException('No refresh token available.', 401);
        }

        const url = 'https://api.platform.trans.eu/ext/auth-api/accounts/token';
        const data = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: tokenRecord.refreshToken,
            client_id: this.config.get('TRANSEU_CLIENT_ID') as string,
            client_secret: this.config.get('TRANSEU_CLIENT_SECRET') as string,
        });

        try {
            const response = await axios.post(url, data.toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Api-key': this.config.get('TRANSEU_API_KEY'),
                },
            });

            const { access_token, token_type, expires_in, refresh_token } = response.data;
            const expiresAt = dayjs().add(expires_in, 'second').toDate();

            await this.prisma.transEuToken.update({
                where: { id: tokenRecord.id },
                data: {
                    accessToken: access_token,
                    refreshToken: refresh_token,
                    tokenType: token_type,
                    expiresAt,
                },
            });

            return access_token;
        } catch (error) {
            throw new HttpException('Token refresh failed', 500);
        }
    }

    async getValidToken(): Promise<string> {
        const tokenRecord = await this.prisma.transEuToken.findFirst();

        if (!tokenRecord) {
            throw new HttpException('No token found. Re-authentication required.', 401);
        }

        if (dayjs(tokenRecord.expiresAt).isBefore(dayjs())) {
            return await this.refreshToken();
        }

        return tokenRecord.accessToken;
    }
}
