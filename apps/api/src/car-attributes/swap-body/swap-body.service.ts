import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, SwapBody } from '../../../generated/prisma/client';

@Injectable()
export class SwapBodyService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.SwapBodyCreateInput): Promise<SwapBody> {
        return this.prisma.swapBody.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.SwapBodyWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[SwapBody[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.swapBody.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.swapBody.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<SwapBody | null> {
        return this.prisma.swapBody.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.SwapBodyUpdateInput): Promise<SwapBody> {
        return this.prisma.swapBody.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<SwapBody> {
        return this.prisma.swapBody.delete({ where: { id } });
    }
}
