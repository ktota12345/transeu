// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Importujemy PrismaService

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async findByEmail(email: string) {
        // Zwracamy użytkownika z pełnymi danymi (w tym hasłem)
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number) {
        // Zwracamy użytkownika z pełnymi danymi (w tym hasłem)
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
}
