import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, BodyProperty } from '../../../generated/prisma/client';

@Injectable()
export class BodyPropertyService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.BodyPropertyCreateInput): Promise<BodyProperty> {
        return this.prisma.bodyProperty.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.BodyPropertyWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[BodyProperty[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.bodyProperty.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.bodyProperty.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<BodyProperty | null> {
        return this.prisma.bodyProperty.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.BodyPropertyUpdateInput): Promise<BodyProperty> {
        return this.prisma.bodyProperty.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<BodyProperty> {
        return this.prisma.bodyProperty.delete({ where: { id } });
    }
}
