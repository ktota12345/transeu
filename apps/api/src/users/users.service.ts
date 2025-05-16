// src/users/users.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Importujemy PrismaService
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}


    async create(data: Prisma.UserCreateInput) {
        return this.prisma.user.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.UserWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[any[], number]> {
        const [users, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                skip,
                take,
                where: filter,
                orderBy: sort,
            }),
            this.prisma.user.count({ where: filter }),
        ]);
        return [users, total];
    }

    async findOne(id: number) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.UserUpdateInput) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
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
