import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Company } from '../../generated/prisma/client';

@Injectable()
export class CompaniesService {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.CompanyCreateInput): Promise<Company> {
        return this.prisma.company.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CompanyWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Company[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.company.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: { users: true },
            }),
            this.prisma.company.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<Company> {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: { users: true },
        });

        if (!company) throw new NotFoundException(`Company with ID ${id} not found`);
        return company;
    }

    async update(id: number, data: Prisma.CompanyUpdateInput): Promise<Company> {
        return this.prisma.company.update({
            where: { id },
            data,
            include: { users: true },
        });
    }

    async remove(id: number): Promise<Company> {
        return this.prisma.company.delete({
            where: { id },
        });
    }
}
