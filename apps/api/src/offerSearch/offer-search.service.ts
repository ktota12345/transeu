import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {TimocomApiService} from './timocomApi/timocom-api.service';

const CLOSEST_CITIES_LIMIT = 2;
const FURTHEST_CITIES_LIMIT = 30;
type CarSpecification = {
    type: string[];
    body: string[];
    bodyProperty: string[];
    equipment: string[];
    loadSecuring: string[];
    swapBody: string[];
};


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
                bodies:true,
                vehicleTypes: true,
                vehicleLoadSecurings: true,
                vehicleEquipments: true,
                swapBodies: true,
                bodyProperties: true,
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


        const closeCities = await this.getClosestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], CLOSEST_CITIES_LIMIT);
        const furthestCities = await this.getFurthestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], FURTHEST_CITIES_LIMIT);
        return {
            carSpecification: {
                type: car.vehicleTypes.map((vt) => vt.apiNameTimocom),
                body: car.bodies.map((bp) => bp.apiNameTimocom),
                bodyProperty: car.bodyProperties.map((bp) => bp.apiNameTimocom),
                equipment: car.vehicleEquipments.map((ve) => ve.apiNameTimocom),
                loadSecuring: car.vehicleLoadSecurings.map((vls) => vls.apiNameTimocom),
                swapBody: car.swapBodies.map((sb) => sb.apiNameTimocom),
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


    async searchOffersBetweenCities(
        carData: {
            carSpecification: CarSpecification;
            period: { startDate: Date | null; endDate: Date | null };
            closeCities: any[];
            furthestCities: any[];
        },
        searchArea = 50,
        page = 1,
        limit = 100
    ) {
        const offers: any[] = [];

        const searchPeriodStartDate = new Date();
        const searchPeriodEndDate = new Date(searchPeriodStartDate.getTime() - 24 * 60 * 60 * 1000);

        for (const start of carData.closeCities) {
            for (const end of carData.furthestCities) {
                const partialOffers = await this.searchOffersBetweenTwoCities(
                    start,
                    end,
                    carData,
                    searchPeriodStartDate,
                    searchPeriodEndDate,
                    searchArea,
                    page,
                    limit,
                );

                offers.push(...partialOffers);
            }
        }

        return this.sortOffers(offers);
    }


    private async searchOffersBetweenTwoCities(
        start: any,
        end: any,
        carData: {
            carSpecification: CarSpecification;
            period: { startDate: Date | null; endDate: Date | null };
        },
        searchPeriodStartDate: Date,
        searchPeriodEndDate: Date,
        searchArea: number,
        page: number,
        limit: number,
    ): Promise<any[]> {
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
            exclusiveLeftLowerBoundDateTime: searchPeriodEndDate.toISOString(),
            inclusiveRightUpperBoundDateTime: searchPeriodStartDate.toISOString(),
            loadingDate: {
                objectType: "individualDates",
                individualDates: [
                    {
                        dateTime: carData.period.startDate?.toISOString().slice(0, 10),
                    },
                ],
            },
            vehicleProperties: {
                type: carData.carSpecification.type,
                body: carData.carSpecification.body,
                bodyProperty: carData.carSpecification.bodyProperty,
                equipment: carData.carSpecification.equipment,
                loadSecuring: carData.carSpecification.loadSecuring,
                swapBody: carData.carSpecification.swapBody,


            },
            paging: {
                page,
                limit,
            },
        };

        const partialOffers = await this.timocomApiService.fetchOffers(searchParams);
        return this.mapOffers(this.filterOffers(partialOffers?.data?.payload ?? []));
    }
    private filterOffers(offers: any[]): any[] {
        return offers.filter(offer =>
            offer &&
            typeof offer === 'object' &&
            'price' in offer &&
            offer.price &&
            typeof offer.price === 'object' &&
            offer.price.amount != null
        );
    }
    private mapOffers(offers: any[]): any[] {
        return offers.map(offer => {
            const price = offer?.price?.amount;
            const distance = offer?.distance_km;

            if (typeof price === 'number' && typeof distance === 'number' && distance > 0) {
                const pricePerKm = Number((price / distance).toFixed(2));
                return {
                    ...offer,
                    pricePerKm,
                };
            }

            return offer;
        });
    }
    private sortOffers(offers: any[]): any[] {
        return offers.sort((a, b) => {
            const priceA = parseFloat(a.pricePerKm);
            const priceB = parseFloat(b.pricePerKm);


            return  priceB - priceA;
        });
    }







}
