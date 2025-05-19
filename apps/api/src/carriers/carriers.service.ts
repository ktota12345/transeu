import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Carrier } from '../../generated/prisma/client';

@Injectable()
export class CarriersService {
    constructor(private prisma: PrismaService) {}

    async create(data: Prisma.CarrierCreateInput): Promise<Carrier> {
        const {
            contacts,
            licenseExpiryDate,
            ...rest
        } = data as any;

        return this.prisma.carrier.create({
            data: {
                ...rest,
                licenseExpiryDate: licenseExpiryDate
                    ? new Date(licenseExpiryDate)
                    : null,
                contacts: {
                    create: Array.isArray(contacts) ? contacts.map((c) => ({
                        ...c,
                        // jeśli details przychodzi jako string, parsujemy
                        details: typeof c.details === 'string' ? JSON.parse(c.details) : c.details
                    })) : [],
                },
            },
            include: { contacts: true },
        });
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
        const carrier = await this.prisma.carrier.findUnique({
            where: { id },
            include: { contacts: true },
        });

        if (!carrier) {
            throw new Error(`Carrier with ID ${id} not found`);
        }

        // Najpierw usuwamy stare kontakty
        await this.prisma.carrierContact.deleteMany({
            where: { carrierId: id },
        });

        // Przygotowanie danych bez kontaktów
        const { contacts, ...carrierData } = data as any;

        return this.prisma.carrier.update({
            where: { id },
            data: {
                ...carrierData,
                contacts: {
                    create: (contacts || []).map((c: any) => ({
                        name: c.name,
                        email: c.email,
                        phone: c.phone,
                        source: c.source,
                        details: typeof c.details === 'string' ? JSON.parse(c.details) : c.details,
                    })),
                },
            },
            include: { contacts: true },
        });
    }



    async remove(id: number): Promise<Carrier> {
        return this.prisma.carrier.delete({ where: { id } });
    }
}
