import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { Car } from '../../generated/prisma/client';

@Injectable()
export class CarsService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CarCreateInput) {
        return this.prisma.car.create({
            data,
        });
    }
    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CarWhereInput,  // Prisma car where filter
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Car[], number]> {
        const [cars, total] = await this.prisma.$transaction([
            this.prisma.car.findMany({
                where: filter,  // Zastosowanie filtra
                skip,
                take,
                orderBy: sort,  // Sortowanie
                include: {
                    driver: true, // <--- dodaj to
                },
            }),
            this.prisma.car.count({
                where: filter,  // Zliczanie po filtrze
            }),
        ]);
        return [cars, total];
    }





    async findOne(id: number) {
        return this.prisma.car.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.CarUpdateInput) {
        return this.prisma.car.update({
            where: { id },
            data,
        });
    }

    async remove(id: number) {
        return this.prisma.car.delete({
            where: { id },
        });
    }
}
