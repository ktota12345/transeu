import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CarSchedule } from '../../generated/prisma/client';

@Injectable()
export class CarSchedulesService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CarScheduleCreateInput): Promise<CarSchedule> {
        return this.prisma.carSchedule.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CarScheduleWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[CarSchedule[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.carSchedule.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: { car: true }, // jeśli chcesz dołączać powiązany samochód
            }),
            this.prisma.carSchedule.count({
                where: filter,
            }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<CarSchedule | null> {
        return this.prisma.carSchedule.findUnique({
            where: { id },
            include: { car: true },
        });
    }

    async update(id: number, data: Prisma.CarScheduleUpdateInput): Promise<CarSchedule> {
        return this.prisma.carSchedule.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<CarSchedule> {
        return this.prisma.carSchedule.delete({
            where: { id },
        });
    }
}
