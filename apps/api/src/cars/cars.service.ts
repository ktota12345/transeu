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
                    schedules: { include: { offers: true } },
                    searchSchedules: true,
                    vehicleTypes: true,
                    vehicleLoadSecurings: true,
                    vehicleEquipments: true,
                    swapBodies: true,
                    bodyProperties: true,
                },
            }),
            this.prisma.car.count({ where: filter }),
        ]);

        const transformedCars = cars.map(car => {
            return {
                ...car,
                searchSchedules: car.searchSchedules.map(s => s.id),
                vehicleTypes: car.vehicleTypes.map(v => v.id),
                vehicleLoadSecurings: car.vehicleLoadSecurings.map(v => v.id),
                vehicleEquipments: car.vehicleEquipments.map(v => v.id),
                swapBodies: car.swapBodies.map(v => v.id),
                bodyProperties: car.bodyProperties.map(v => v.id),
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
                vehicleTypes: true,
                vehicleLoadSecurings: true,
                vehicleEquipments: true,
                swapBodies: true,
                bodyProperties: true,
                searchNotificationSetup: {
                    include: { users: true },
                },
            },
        });

        if (!car) return null;


        return {
            ...car,
            searchSchedules: car.searchSchedules.map(s => s.id),
            vehicleTypes: car.vehicleTypes.map(v => v.id),
            vehicleLoadSecurings: car.vehicleLoadSecurings.map(v => v.id),
            vehicleEquipments: car.vehicleEquipments.map(v => v.id),
            swapBodies: car.swapBodies.map(v => v.id),
            bodyProperties: car.bodyProperties.map(v => v.id),
            searchNotificationSetup: {
                ...car.searchNotificationSetup,
                users: car.searchNotificationSetup?.users.map((user: any) => user.id) || [],
            }
        };
    }



    async update(id: number, data: any) {
        const {
            schedules,
            driverId,
            searchSchedules,
            vehicleTypes,
            vehicleLoadSecurings,
            vehicleEquipments,
            swapBodies,
            bodyProperties,
            ...rest
        } = data;

        const updateData: Prisma.CarUpdateInput = { ...rest };

        if (driverId && typeof driverId === 'number') {
            updateData.driver = {
                connect: { id: driverId },
            };
        }

        const handleRelation = (input: any) =>
            input?.map((item: any) =>
                typeof item === 'object' && item !== null && 'id' in item ? { id: item.id } : { id: item }
            );

        if (searchSchedules && Array.isArray(searchSchedules)) {
            updateData.searchSchedules = {
                set: [],
                connect: handleRelation(searchSchedules),
            };
        }

        if (vehicleTypes && Array.isArray(vehicleTypes)) {
            updateData.vehicleTypes = {
                set: [],
                connect: handleRelation(vehicleTypes),
            };
        }

        if (vehicleLoadSecurings && Array.isArray(vehicleLoadSecurings)) {
            updateData.vehicleLoadSecurings = {
                set: [],
                connect: handleRelation(vehicleLoadSecurings),
            };
        }

        if (vehicleEquipments && Array.isArray(vehicleEquipments)) {
            updateData.vehicleEquipments = {
                set: [],
                connect: handleRelation(vehicleEquipments),
            };
        }

        if (swapBodies && Array.isArray(swapBodies)) {
            updateData.swapBodies = {
                set: [],
                connect: handleRelation(swapBodies),
            };
        }

        if (bodyProperties && Array.isArray(bodyProperties)) {
            updateData.bodyProperties = {
                set: [],
                connect: handleRelation(bodyProperties),
            };
        }

        // Obsługa schedule (jak wcześniej)
        if (schedules) {
            const existingSchedules = await this.prisma.carSchedule.findMany({ where: { carId: id } });

            const schedulesToUpdate = schedules.filter((s: any) => s.id);
            const schedulesToCreate = schedules.filter((s: any) => !s.id);
            const schedulesToDelete = existingSchedules.filter(
                (s: any) => !schedules.some((sch: any) => sch.id === s.id)
            );

            await this.prisma.carSchedule.deleteMany({ where: { id: { in: schedulesToDelete.map((s: any) => s.id) } } });

            await Promise.all(
                schedulesToUpdate.map((s: any) =>
                    this.prisma.carSchedule.update({
                        where: { id: s.id },
                        data: {
                            from: new Date(s.from),
                            to: new Date(s.to),
                            status: s.status,
                        },
                    })
                )
            );

            await this.prisma.carSchedule.createMany({
                data: schedulesToCreate.map((s: any) => ({
                    carId: id,
                    from: new Date(s.from),
                    to: new Date(s.to),
                    status: s.status,
                })),
            });
        }

        if (data.searchNotificationSetup) {
            const sns = data.searchNotificationSetup;

            if (sns.id) {
                updateData.searchNotificationSetup = {
                    update: {
                        customEmails: sns.customEmails,
                        users: {
                            set: [],
                            connect: (sns.users || []).map((user: any) =>
                                typeof user === 'object' ? { id: user.id } : { id: user }
                            ),
                        },
                    },
                };

            } else {
                updateData.searchNotificationSetup = {
                    create: {
                        customEmails: sns.customEmails,
                        users: {
                            connect: sns.users?.map((userId: number) => ({ id: userId })) || [],
                        },
                    },
                };
            }
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
