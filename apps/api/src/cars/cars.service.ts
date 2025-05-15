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
        filter?: Prisma.CarWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[any[], number]> {
        const [cars, total] = await this.prisma.$transaction([
            this.prisma.car.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: {
                    driver: true,
                    schedules: {
                        include: {
                            offers: true,
                        },
                    },
                    searchSchedules: true,
                },
            }),
            this.prisma.car.count({
                where: filter,
            }),
        ]);

        // Pobierz schematy domyślne
        // const defaultSchedules = await this.prisma.searchScheduleSetup.findMany({
        //     where: { isDefault: true },
        //     select: { id: true },
        // });
        //const defaultIds = defaultSchedules.map(s => s.id);

        const transformedCars = cars.map(car => {
            const allScheduleIds = [
                ...car.searchSchedules.map(s => s.id),
                //...defaultIds,
            ];
            const uniqueIds = Array.from(new Set(allScheduleIds));

            return {
                ...car,
                searchSchedules: uniqueIds,
            };
        });

        return [transformedCars, total];
    }


    async findOne(id: number) {
        const car = await this.prisma.car.findUnique({
            where: { id },
            include: {
                driver: true,
                schedules: true,
                searchSchedules: true,
            },
        });

        if (!car) return null;

        // Pobierz schematy domyślne
        // const defaultSchedules = await this.prisma.searchScheduleSetup.findMany({
        //     where: { isDefault: true },
        //     select: { id: true },
        // });

        const allScheduleIds = [
            ...car.searchSchedules.map(s => s.id),
            //...defaultSchedules.map(s => s.id),
        ];

        // Usuń duplikaty
        const uniqueScheduleIds = Array.from(new Set(allScheduleIds));

        return {
            ...car,
            searchSchedules: uniqueScheduleIds,
        };
    }


    async update(id: number, data: any) {
        const { schedules, driverId, searchSchedules, ...rest } = data;
        const updateData: Prisma.CarUpdateInput = { ...rest };

        if (driverId && typeof driverId === 'number') {
            updateData.driver = {
                connect: { id: driverId },
            };
        }

        if (searchSchedules && Array.isArray(searchSchedules)) {
            updateData.searchSchedules = {
                set: [],
                connect: searchSchedules.map((item: any) => {
                    if (typeof item === 'object' && item !== null && 'id' in item) {
                        return { id: item.id };
                    }
                    return { id: item };
                }),
            };
        }


        if (schedules) {
            const existingSchedules = await this.prisma.carSchedule.findMany({
                where: { carId: id },
            });

            const schedulesToUpdate = schedules.filter((schedule: any) => schedule.id);
            const schedulesToCreate = schedules.filter((schedule: any) => !schedule.id);
            const schedulesToDelete = existingSchedules.filter((existing: any) =>
                !schedules.some((schedule: any) => schedule.id === existing.id)
            );

            await this.prisma.carSchedule.deleteMany({
                where: {
                    id: { in: schedulesToDelete.map((s: any) => s.id) },
                },
            });

            await Promise.all(
                schedulesToUpdate.map((schedule: any) =>
                    this.prisma.carSchedule.update({
                        where: { id: schedule.id },
                        data: {
                            from: new Date(schedule.from),
                            to: new Date(schedule.to),
                            status: schedule.status,
                        },
                    })
                )
            );

            await this.prisma.carSchedule.createMany({
                data: schedulesToCreate.map((schedule: any) => ({
                    carId: id,
                    from: new Date(schedule.from),
                    to: new Date(schedule.to),
                    status: schedule.status,
                })),
            });
        }

        await this.prisma.car.update({
            where: { id },
            data: updateData,
        });

        return this.findOne(id);
    }


    async remove(id: number) {
        return this.prisma.car.delete({
            where: { id },
        });
    }
}
