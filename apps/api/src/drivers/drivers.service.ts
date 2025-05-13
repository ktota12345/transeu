import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Driver } from '../../generated/prisma/client';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.DriverCreateInput): Promise<Driver> {
        return this.prisma.driver.create({ data });
    }
    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.DriverWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Driver[], number]> {
        const [drivers, total] = await this.prisma.$transaction([
            this.prisma.driver.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.driver.count({
                where: filter,
            }),
        ]);
        return [drivers, total];
    }


    async findOne(id: number): Promise<Driver | null> {
        return this.prisma.driver.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.DriverUpdateInput): Promise<Driver> {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Driver> {
        return this.prisma.driver.delete({ where: { id } });
    }
}
