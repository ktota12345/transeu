import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Prisma} from '../../generated/prisma/client';
import {Car} from '../../generated/prisma/client';

@Injectable()
export class CarsService {
    constructor(private prisma: PrismaService) {
    }

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
                    schedules: true, // <-- Dodane
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
            where: {id},
            include: {
                driver: true,
                schedules: true, // <-- Dodane
            },
        });
    }

    async update(id: number, data: any) {
        const {schedules, driverId, ...rest} = data;

        const updateData: Prisma.CarUpdateInput = {
            ...rest,
        };

        // Obsługa relacji driverId → driver.connect
        if (driverId && typeof driverId === 'number') {
            updateData.driver = {
                connect: {id: driverId},
            };
        }

        if (schedules) {
            // Zaktualizuj stare harmonogramy, dodaj nowe, usuń usunięte
            const existingSchedules = await this.prisma.carSchedule.findMany({
                where: {carId: id},
            });

            const schedulesToUpdate = schedules.filter((schedule: any) => schedule.id); // Harmonogramy, które mają id
            const schedulesToCreate = schedules.filter((schedule: any) => !schedule.id); // Harmonogramy, które nie mają id
            const schedulesToDelete = existingSchedules.filter((existing: any) =>
                !schedules.some((schedule: any) => schedule.id === existing.id) // Harmonogramy, które zostały usunięte
            );

            // Usuwanie starych harmonogramów, które zostały usunięte
            await this.prisma.carSchedule.deleteMany({
                where: {
                    id: {in: schedulesToDelete.map((schedule: any) => schedule.id)},
                },
            });

            // Zaktualizowanie istniejących harmonogramów
            await Promise.all(
                schedulesToUpdate.map((schedule: any) => {
                    return this.prisma.carSchedule.update({
                        where: {id: schedule.id},
                        data: {
                            from: new Date(schedule.from),
                            to: new Date(schedule.to),
                            status: schedule.status,
                        },
                    });
                })
            );

            // Dodanie nowych harmonogramów
            await this.prisma.carSchedule.createMany({
                data: schedulesToCreate.map((schedule: any) => ({
                    carId: id,
                    from: new Date(schedule.from),
                    to: new Date(schedule.to),
                    status: schedule.status,
                })),
            });
        }

        // Wykonaj aktualizację samochodu
        await this.prisma.car.update({
            where: {id},
            data: updateData,
        });

        return this.findOne(id);
    }


    async remove(id: number) {
        return this.prisma.car.delete({
            where: {id},
        });
    }
}
