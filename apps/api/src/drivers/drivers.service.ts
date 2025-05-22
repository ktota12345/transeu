import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Driver } from '../../generated/prisma/client';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.DriverCreateInput): Promise<Driver> {
        return this.prisma.driver.create({ data });
    }

    async findAll(
        skip = 0,
        take = 10,
        filter?: Prisma.DriverWhereInput,
        sort?: { [key: string]: Prisma.SortOrder }
    ): Promise<[any[], number]> {
        const [drivers, total] = await this.prisma.$transaction([
            this.prisma.driver.findMany({
                where: filter,
                skip,
                take,
                orderBy: sort,
                include: {
                    allowedCountries: true,
                },
            }),
            this.prisma.driver.count({ where: filter }),
        ]);

        const transformedDrivers = drivers.map((driver) => ({
            ...driver,
            // zamieniamy allowedCountries na tablicę kodów
            allowedCountries: driver.allowedCountries.map((c) => c.id),
        }));

        return [transformedDrivers, total];
    }

    async findOne(id: number): Promise<any | null> {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: {
                allowedCountries: true,
            },
        });

        if (!driver) return null;

        return {
            ...driver,
            allowedCountries: driver.allowedCountries.map((c) => c.id),
        };
    }

    async update(id: number, data: Prisma.DriverUpdateInput): Promise<Driver> {
        const raw = data as any;

        const updateData: Prisma.DriverUpdateInput = { ...raw };

        if (Array.isArray(raw.allowedCountries)) {
            // Wyciągamy id z obiektów lub wartości numeryczne
            const ids = raw.allowedCountries
                .map((item: any) =>
                    typeof item === 'object' && item !== null && 'id' in item
                        ? item.id
                        : typeof item === 'number'
                            ? item
                            : null
                )
                .filter((id: number | null) => id !== null) as number[];

            // Pobierz kody krajów z id
            const countries = await this.prisma.country.findMany({
                where: { id: { in: ids } },
                select: { code: true },
            });

            // Nadpisujemy allowedCountries relacją 'set' na kody krajów
            updateData.allowedCountries = {
                set: [], // czyścimy wszystkie powiązania
                connect: countries.map((c) => ({ code: c.code })),
            };
        }

        return this.prisma.driver.update({
            where: { id },
            data: updateData,
        });
    }

    async remove(id: number): Promise<Driver> {
        return this.prisma.driver.delete({ where: { id } });
    }
}
