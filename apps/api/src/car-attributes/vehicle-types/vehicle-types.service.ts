import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, VehicleType } from '../../../generated/prisma/client';

@Injectable()
export class VehicleTypesService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.VehicleTypeCreateInput): Promise<VehicleType> {
        return this.prisma.vehicleType.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.VehicleTypeWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[VehicleType[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleType.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.vehicleType.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<VehicleType | null> {
        return this.prisma.vehicleType.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.VehicleTypeUpdateInput): Promise<VehicleType> {
        return this.prisma.vehicleType.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<VehicleType> {
        return this.prisma.vehicleType.delete({ where: { id } });
    }
}
