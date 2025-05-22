import {HttpException, HttpStatus, Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {Prisma, CarScheduleOffer} from '../../generated/prisma/client';

@Injectable()
export class CarScheduleOffersService {
    constructor(private prisma: PrismaService) {
    }

    async create(data: Prisma.CarScheduleOfferCreateInput): Promise<CarScheduleOffer> {
        return this.prisma.carScheduleOffer.create({data});
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
                    fromAddress: true,
                    toAddress: true,
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
            where: {id},
            include: {
                car: true,
                driver: true,
                carSchedule: true,
                fromAddress: true,
                toAddress: true,
            },
        });
    }

    async update(id: number, data: any): Promise<CarScheduleOffer> {
        const {
            carId, driverId, carScheduleId, fromAddressId,
            toAddressId, details, ...rest
        } = data;

        const updateData: Prisma.CarScheduleOfferUpdateInput = {
            ...rest,
            // Przekazywanie danych JSON details
            details: details ? details : undefined,
            updatedAt: new Date(), // Ustawienie daty aktualizacji
        };

        // Obsługa relacji: carId, driverId, carScheduleId
        if (carId) {
            updateData.car = {connect: {id: carId}};
        }

        if (driverId) {
            updateData.driver = {connect: {id: driverId}};
        }

        if (carScheduleId) {
            updateData.carSchedule = {connect: {id: carScheduleId}};
        }

        if (fromAddressId) {
            updateData.fromAddress = { connect: { id: fromAddressId } };
        }

        if (toAddressId) {
            updateData.toAddress = { connect: { id: toAddressId } };
        }
        // Wykonaj aktualizację carScheduleOffer
        const updatedOffer = await this.prisma.carScheduleOffer.update({
            where: {id},
            data: updateData,
        });

        return updatedOffer;
    }

    async remove(id: number): Promise<CarScheduleOffer> {
        return this.prisma.carScheduleOffer.delete({where: {id}});
    }

    async assignExternalOffer(payload: any): Promise<CarScheduleOffer> {
        const {carId, details} = payload;

        if (!carId || !details?.loadingPlaces?.length) {
            throw new HttpException('Missing required fields: carId or loadingPlaces', HttpStatus.BAD_REQUEST);
        }

        const loading = details.loadingPlaces.find((p) => p.loadingType === 'LOADING');
        const unloading = details.loadingPlaces.find((p) => p.loadingType === 'UNLOADING');

        if (!loading?.earliestLoadingDate || !unloading?.latestLoadingDate) {
            throw new HttpException('Missing loading/unloading date info in loadingPlaces', HttpStatus.BAD_REQUEST);
        }

        const fromDate = new Date(loading.earliestLoadingDate);
        const toDate = new Date(unloading.latestLoadingDate);

        // --- Pobieramy auto i kierowcę ---
        const car = await this.prisma.car.findUnique({
            where: {id: carId},
            include: {driver: true},
        });

        if (!car) {
            throw new HttpException(`Car with ID ${carId} not found`, HttpStatus.NOT_FOUND);
        }

        // --- Szukamy pasującego schedule ---
        const matchingSchedule = await this.prisma.carSchedule.findFirst({
            where: {
                carId,
                //from: {lte: twoDaysBefore},
                //to: {gte: toDate},
            },
        });

        if (!matchingSchedule) {
            throw new HttpException('No matching CarSchedule for given date range', HttpStatus.BAD_REQUEST);
        }

        // --- Tworzymy adresy ---
        const fromAddress = await this.prisma.address.create({
            data: {
                country: loading.address.country,
                city: loading.address.city,
                postalCode: loading.address.postalCode,
                latitude: loading.address.geoCoordinate.latitude,
                longitude: loading.address.geoCoordinate.longitude,
            },
        });

        const toAddress = await this.prisma.address.create({
            data: {
                country: unloading.address.country,
                city: unloading.address.city,
                postalCode: unloading.address.postalCode,
                latitude: unloading.address.geoCoordinate.latitude,
                longitude: unloading.address.geoCoordinate.longitude,
            },
        });
        // --- Tworzymy ofertę ---
        const offer = await this.prisma.carScheduleOffer.create({
            data: {
                fromDate,
                toDate,
                status: 'pending',
                externalId: payload.details.id,
                externalLink: payload.details.deeplink,
                sourceSystem: 'timocom',
                details,
                car: {connect: {id: car.id}},
                driver: car.driverId ? {connect: {id: car.driverId}} : undefined,
                carSchedule: {connect: {id: matchingSchedule.id}},
                fromAddress: {connect: {id: fromAddress.id}},
                toAddress: {connect: {id: toAddress.id}},
            },
        });

        return offer;
    }

}
