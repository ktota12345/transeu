import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput) {
        if (data.password) {
            const hashedPassword = await bcrypt.hash(data.password, 10);
            data.password = hashedPassword;
        }
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
        // Jeśli jest password w danych, zahashuj je
        if ('password' in data && data.password) {
            const hashedPassword = await bcrypt.hash(data.password as string, 10);
            data.password = hashedPassword;
        } else {
            // Jeśli password jest undefined lub null, usuń pole z update, żeby nie nadpisać
            delete data.password;
        }

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
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }
}
