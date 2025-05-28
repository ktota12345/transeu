import { Module } from '@nestjs/common';
import { TransEuAuthService } from './trans-eu-auth.service';
import { TransEuAuthController } from './trans-eu-auth.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    controllers: [TransEuAuthController],
    providers: [TransEuAuthService, PrismaService],
    exports: [TransEuAuthService],
})
export class TransEuAuthModule {}
