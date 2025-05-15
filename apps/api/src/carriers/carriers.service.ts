import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Carrier } from '../../generated/prisma/client';

@Injectable()
export class CarriersService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CarrierCreateInput): Promise<Carrier> {
        return this.prisma.carrier.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CarrierWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[Carrier[], number]> {
        const [carriers, total] = await this.prisma.$transaction([
            this.prisma.carrier.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: { contacts: true }, // jeśli chcesz też relacje
            }),
            this.prisma.carrier.count({
                where: filter,
            }),
        ]);
        return [carriers, total];
    }

    async findOne(id: number): Promise<Carrier | null> {
        return this.prisma.carrier.findUnique({
            where: { id },
            include: { contacts: true }, // jeśli potrzebujesz kontaktów od razu
        });
    }

    async update(id: number, data: Prisma.CarrierUpdateInput): Promise<Carrier> {
        return this.prisma.carrier.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Carrier> {
        return this.prisma.carrier.delete({ where: { id } });
    }
}
