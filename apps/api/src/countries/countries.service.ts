import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Country } from '../../generated/prisma/client';

@Injectable()
export class CountriesService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CountryCreateInput): Promise<Country> {
        return this.prisma.country.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CountryWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Country[], number]> {
        const [countries, total] = await this.prisma.$transaction([
            this.prisma.country.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.country.count({ where: filter }),
        ]);
        return [countries, total];
    }

    async findOne(code: string): Promise<Country | null> {
        return this.prisma.country.findUnique({ where: { code } });
    }

    async update(code: string, data: Prisma.CountryUpdateInput): Promise<Country> {
        return this.prisma.country.update({
            where: { code },
            data,
        });
    }

    async remove(code: string): Promise<Country> {
        return this.prisma.country.delete({ where: { code } });
    }
}
