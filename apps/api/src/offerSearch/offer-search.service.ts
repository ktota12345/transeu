import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {TimocomApiService} from './timocomApi/timocom-api.service';

type CarSpecification = {
    type: string[];
    body: string[];
    bodyProperty: string[];
    equipment: string[];
    loadSecuring: string[];
    swapBody: string[];
    carId: number;
};


@Injectable()
export class OfferSearchService {
    constructor(
        private prisma: PrismaService,
        private readonly timocomApiService: TimocomApiService,
    ) {
    }

    async getCarForSearch(carId: number,{
        numLoadingCities = 1,
        numUnloadingCities = 1,
    }: {
        numLoadingCities: number;
        numUnloadingCities: number;
    }) {
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
                baseAddress: true,
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

        const schedule = car.schedules[0];

        let plannedLocation;

        if (car.schedules.length > 0) {
            const confirmedOffer = await this.prisma.carScheduleOffer.findFirst({
                where: {
                    carScheduleId: schedule.id,
                    status: 'confirmed',
                },
                include: {
                    fromAddress: true,
                    toAddress: true,
                },
            });
            if (confirmedOffer?.toAddress) {
                const address = confirmedOffer.toAddress;

                plannedLocation = {
                    address: {
                        objectType: 'address',
                        country: address.country,
                        postalCode: address.postalCode,
                        city: address.city,
                        location: [address.latitude, address.longitude],
                    },
                    date: confirmedOffer.toDate

                };
            }
        }

        if (!plannedLocation) {
            if (!car.baseAddress) {
                throw new Error(`Car with ID ${carId} has no base address.`);
            }

            plannedLocation = {
                address: {
                    objectType: 'address',
                    country: car.baseAddress.country,
                    postalCode: car.baseAddress.postalCode,
                    city: car.baseAddress.city,
                    location: [car.baseAddress.latitude, car.baseAddress.longitude],
                },
                date: car.schedules[0]?.from,
            };
        }


        const closeCities = await this.getClosestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], numLoadingCities);
        const furthestCities = await this.getFurthestCities(plannedLocation.address.location[0], plannedLocation.address.location[1], numUnloadingCities);
        return {
            carSpecification: {
                type: car.vehicleTypes.map((vt) => vt.apiNameTimocom),
                body: car.bodies.map((bp) => bp.apiNameTimocom),
                bodyProperty: car.bodyProperties.map((bp) => bp.apiNameTimocom),
                equipment: car.vehicleEquipments.map((ve) => ve.apiNameTimocom),
                loadSecuring: car.vehicleLoadSecurings.map((vls) => vls.apiNameTimocom),
                swapBody: car.swapBodies.map((sb) => sb.apiNameTimocom),
                carId: car.id,
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
        },{
            searchArea,
            perPage,
        }: {
            searchArea: number;
            perPage: number;
        },

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
                    1,
                    perPage,
                );

                offers.push(...partialOffers);
            }
        }


        const fullOffers = this.sortOffers(offers);

        const externalIds = fullOffers
            .map(o => o.id)
            .filter((id): id is string => !!id); // tylko nie-null

        const existingOffers = await this.prisma.carScheduleOffer.findMany({
            where: {
                externalId: {
                    in: externalIds,
                },
                sourceSystem: 'timocom',
            },
        });

        const existingMap = new Map(existingOffers.map(e => [e.externalId, e]));

        const offersWithStatus = offers.map(offer => {
            const match = offer.id ? existingMap.get(offer.id) : null;
            return {
                ...offer,
                alreadySaved: !!match,
                savedOffer: match
            };
        });

        return offersWithStatus;
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
