// src/prisma/prisma.module.ts
import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service'; // Twoja klasa PrismaService

@Module({
    providers: [PrismaService],
    exports: [PrismaService], // Musisz eksportować PrismaService, aby był dostępny w innych modułach
})
export class PrismaModule {}
