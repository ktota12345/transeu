import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {TimocomApiService} from './timocomApi/timocom-api.service';

@Injectable()
export class OfferSearchService {
    constructor(
        private prisma: PrismaService,
        private readonly timocomApiService: TimocomApiService,
    ) {
    }

    async getCarForSearch(carId: number) {
        const now = new Date();

        const car = await this.prisma.car.findUnique({
            where: {
                id: carId,
            },
            include: {
                vehicleTypes: true,
                schedules: {
                    where: {
                        to: {
                            gt: now,
                        },
                    },
                    orderBy: {
                        from: 'asc',
                    },
                    take: 1,
                },
            },
        });

        if (!car) {
            throw new Error(`Car with ID ${carId} not found.`);
        }
        const schedule = car?.schedules[0];

        const plannedLocation = {
            address: {
                objectType: 'address',
                country: 'PL',
                postalCode: '43-300',
                city: 'Bielsko-Biała',
                location: [49.8224, 19.0469],
            },
        };
        const closeCities = await this.getClosestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], 3);
        const furthestCities = await this.getFurthestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], 3);
        return {
            carSpecification: {
                vehicleTypeCodes: car.vehicleTypes.map((vt) => vt.apiNameTimocom),
            },
            period: {
                startDate: schedule?.from ?? null,
                endDate: schedule?.to ?? null,
            },
            plannedLocation,
            closeCities,
            furthestCities

        };
    }

    async getClosestCities(lat: number, lng: number, limit: number = 5) {
        return this.prisma.$queryRawUnsafe<any>(`
            SELECT id,
                   name,
                   "postalCode",
                   country,
                   latitude,
                   longitude,
                   (
                       6371 * acos(
                               cos(radians(${lat})) * cos(radians(latitude)) *
                               cos(radians(longitude) - radians(${lng})) +
                               sin(radians(${lat})) * sin(radians(latitude))
                              )
                       ) AS distance
            FROM "City"
            ORDER BY distance ASC
            LIMIT ${limit};
        `);
    }

    async getFurthestCities(lat: number, lng: number, limit: number = 5) {
        return this.prisma.$queryRawUnsafe<any>(`
            SELECT id,
                   name,
                   "postalCode",
                   country,
                   latitude,
                   longitude,
                   (
                       6371 * acos(
                               cos(radians(${lat})) * cos(radians(latitude)) *
                               cos(radians(longitude) - radians(${lng})) +
                               sin(radians(${lat})) * sin(radians(latitude))
                              )
                       ) AS distance
            FROM "City"
            ORDER BY distance DESC
            LIMIT ${limit};
        `);
    }


    async searchOffersBetweenCities(carData: {
        carSpecification: { vehicleTypeCodes: string[] };
        period: { startDate: Date | null; endDate: Date | null };
        closeCities: any[];
        furthestCities: any[];
    }, searchArea = 50, page = 1, limit = 100) {
        const offers: any[] = [];

        for (const start of carData.closeCities) {
            for (const end of carData.furthestCities) {
                const searchParams = {
                    startLocation: {
                        objectType: 'areaSearch',
                        area: {
                            address: {
                                objectType: 'address',
                                country: start.country,
                                postalCode: start.postalCode,
                                city: start.name,
                            },
                            size_km: searchArea,
                        },
                    },
                    destinationLocation: {
                        objectType: 'areaSearch',
                        area: {
                            address: {
                                objectType: 'address',
                                country: end.country,
                                postalCode: end.postalCode,
                                city: end.name,
                            },
                            size_km: searchArea,
                        },
                    },
                    exclusiveLeftLowerBoundDateTime: carData.period.startDate,
                    inclusiveRightUpperBoundDateTime: carData.period.endDate,
                    vehicleTypeCodes: carData.carSpecification.vehicleTypeCodes,
                    paging: {
                        page,
                        limit,
                    },
                };

                const partialOffers = await this.timocomApiService.fetchOffers(searchParams);
                if (partialOffers?.data?.payload) {
                    offers.push(...partialOffers.data.payload);
                }
            }
        }

        return offers.sort((a, b) =>  (b.distance_km ?? 0) - (a.distance_km ?? 0) );
    }

}
