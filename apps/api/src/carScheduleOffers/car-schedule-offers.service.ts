import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, CarScheduleOffer } from '../../generated/prisma/client';

@Injectable()
export class CarScheduleOffersService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CarScheduleOfferCreateInput): Promise<CarScheduleOffer> {
        return this.prisma.carScheduleOffer.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.CarScheduleOfferWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[CarScheduleOffer[], number]> {
        const [offers, total] = await this.prisma.$transaction([
            this.prisma.carScheduleOffer.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: {
                    car: true,
                    driver: true,
                    carSchedule: true,
                },
            }),
            this.prisma.carScheduleOffer.count({
                where: filter,
            }),
        ]);
        return [offers, total];
    }

    async findOne(id: number): Promise<CarScheduleOffer | null> {
        return this.prisma.carScheduleOffer.findUnique({
            where: { id },
            include: {
                car: true,
                driver: true,
                carSchedule: true,
            },
        });
    }
    async update(id: number, data: any): Promise<CarScheduleOffer> {
        const { carId, driverId, carScheduleId, details, ...rest } = data;

        const updateData: Prisma.CarScheduleOfferUpdateInput = {
            ...rest,
            // Przekazywanie danych JSON details
            details: details ? details : undefined,
            updatedAt: new Date(), // Ustawienie daty aktualizacji
        };

        // Obsługa relacji: carId, driverId, carScheduleId
        if (carId) {
            updateData.car = { connect: { id: carId } };
        }

        if (driverId) {
            updateData.driver = { connect: { id: driverId } };
        }

        if (carScheduleId) {
            updateData.carSchedule = { connect: { id: carScheduleId } };
        }

        // Wykonaj aktualizację carScheduleOffer
        const updatedOffer = await this.prisma.carScheduleOffer.update({
            where: { id },
            data: updateData,
        });

        return updatedOffer;
    }




    async remove(id: number): Promise<CarScheduleOffer> {
        return this.prisma.carScheduleOffer.delete({ where: { id } });
    }
}
