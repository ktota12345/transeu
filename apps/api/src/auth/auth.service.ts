// src/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'; // Dla generowania losowych tokenów
import { PrismaService } from '../prisma/prisma.service'; // W razie potrzeby

import { compare } from 'bcryptjs';
@Injectable()
export class AuthService {
  constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
      private prisma: PrismaService, // Dodane do obsługi tokenu resetowania
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email); // Znajdź użytkownika
    if (user && user.password && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user; // Destrukturalizujemy i usuwamy hasło
      return result;
    }
    return null;
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    const plainPassword = "user123";
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    if(user) {
      console.log("Hashed password:", hashedPassword);
      console.log("User password from DB:", user.password);  // Hasło w bazie danych
      console.log("Password from request:", password);  // Hasło podane przez użytkownika

// Sprawdzanie, czy hasło się zgadza
      const passwordMatch = await compare(password, user.password);
      console.log("Password match result:", passwordMatch); // Prawda/fałsz
    }
    if (!user || !(await compare(password, user.password))) {
      throw new Error('Invalid credentials');
    }

    // Generowanie tokenu JWT
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  // Nowa metoda resetowania hasła
  async generateResetToken(email: string): Promise<string> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token ważny przez 1 godzinę

    // Zapisz token w bazie danych
    await this.prisma.user.update({
      where: { email }, // Użyj emaila jako unikalnego identyfikatora
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    return resetToken; // Możesz wysłać ten token na email użytkownika
  }

  // Nowa metoda do resetowania hasła
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    // Zmiana z findUnique na findFirst aby szukać po resetToken
    const user = await this.prisma.user.findFirst({
      where: { resetToken: token }, // Wyszukiwanie po resetToken
    });

    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    // Sprawdź, czy token nie wygasł
    if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
      throw new UnauthorizedException('Expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Zaktualizuj hasło użytkownika
    await this.prisma.user.update({
      where: { email: user.email }, // Zmieniamy na email
      data: {
        password: hashedPassword,
        resetToken: null, // Wyczyść token po zakończeniu procesu
        resetTokenExpiry: null, // Wyczyść datę wygaśnięcia tokenu
      },
    });

    return true;
  }
}
