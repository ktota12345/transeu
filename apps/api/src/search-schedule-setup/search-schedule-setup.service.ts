import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, SearchScheduleSetup } from '../../generated/prisma/client';

@Injectable()
export class SearchScheduleSetupService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.SearchScheduleSetupCreateInput): Promise<SearchScheduleSetup> {
        return this.prisma.searchScheduleSetup.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.SearchScheduleSetupWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[SearchScheduleSetup[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.searchScheduleSetup.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.searchScheduleSetup.count({
                where: filter,
            }),
        ]);

        return [items, total];
    }

    async findOne(id: number): Promise<SearchScheduleSetup | null> {
        return this.prisma.searchScheduleSetup.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.SearchScheduleSetupUpdateInput): Promise<SearchScheduleSetup> {
        return this.prisma.searchScheduleSetup.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<SearchScheduleSetup> {
        return this.prisma.searchScheduleSetup.delete({ where: { id } });
    }
}
