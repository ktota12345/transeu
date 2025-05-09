// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from '../prisma/prisma.module'; // Importuj PrismaModule

@Module({
    imports: [PrismaModule], // Importujemy PrismaModule, aby PrismaService był dostępny
    providers: [UsersService],
    exports: [UsersService], // Eksportuj UsersService, jeśli chcesz używać go w innych modułach
})
export class UsersModule {}
