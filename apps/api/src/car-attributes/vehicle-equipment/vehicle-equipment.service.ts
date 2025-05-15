import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma, VehicleEquipment } from '../../../generated/prisma/client';

@Injectable()
export class VehicleEquipmentService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.VehicleEquipmentCreateInput): Promise<VehicleEquipment> {
        return this.prisma.vehicleEquipment.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.VehicleEquipmentWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[VehicleEquipment[], number]> {
        const [items, total] = await this.prisma.$transaction([
            this.prisma.vehicleEquipment.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
            }),
            this.prisma.vehicleEquipment.count({ where: filter }),
        ]);
        return [items, total];
    }

    async findOne(id: number): Promise<VehicleEquipment | null> {
        return this.prisma.vehicleEquipment.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.VehicleEquipmentUpdateInput): Promise<VehicleEquipment> {
        return this.prisma.vehicleEquipment.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<VehicleEquipment> {
        return this.prisma.vehicleEquipment.delete({ where: { id } });
    }
}
