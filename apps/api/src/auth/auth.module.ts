// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service'; // Upewnij się, że UsersService jest zaimportowane
import { PrismaModule } from '../prisma/prisma.module'; // Importuj PrismaModule, aby PrismaService był dostępny
import { JwtModule } from '@nestjs/jwt'; // Jeśli używasz JwtModule

@Module({
  imports: [PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey', // Zdefiniuj tutaj klucz
      signOptions: { expiresIn: '60s' }, // Opcjonalnie możesz ustawić czas ważności tokenu
    })], // Importujemy PrismaModule i inne potrzebne moduły
  providers: [AuthService, UsersService],
  exports: [AuthService], // Eksportujemy AuthService, jeśli chcesz używać go w innych modułach
})
export class AuthModule {}
