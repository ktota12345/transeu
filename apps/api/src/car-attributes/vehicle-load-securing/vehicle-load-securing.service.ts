import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, VehicleLoadSecuring } from '../../../generated/prisma/client';

@Injectable()
export class VehicleLoadSecuringService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.VehicleLoadSecuringCreateInput): Promise<VehicleLoadSecuring> {
        return this.prisma.vehicleLoadSecuring.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.VehicleLoadSecuringWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[VehicleLoadSecuring[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleLoadSecuring.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.vehicleLoadSecuring.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<VehicleLoadSecuring | null> {
        return this.prisma.vehicleLoadSecuring.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.VehicleLoadSecuringUpdateInput): Promise<VehicleLoadSecuring> {
        return this.prisma.vehicleLoadSecuring.update({ where: { id }, data });
    }

    async remove(id: number): Promise<VehicleLoadSecuring> {
        return this.prisma.vehicleLoadSecuring.delete({ where: { id } });
    }
}
