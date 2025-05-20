import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, VehicleBody } from '../../../generated/prisma/client';

@Injectable()
export class VehicleBodyService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.VehicleBodyCreateInput): Promise<VehicleBody> {
        return this.prisma.vehicleBody.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.VehicleBodyWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[VehicleBody[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleBody.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.vehicleBody.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<VehicleBody | null> {
        return this.prisma.vehicleBody.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.VehicleBodyUpdateInput): Promise<VehicleBody> {
        return this.prisma.vehicleBody.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<VehicleBody> {
        return this.prisma.vehicleBody.delete({ where: { id } });
    }
}
