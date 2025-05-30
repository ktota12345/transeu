import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {TimocomApiService} from './timocomApi/timocom-api.service';
import {TransEuApiAppService}  from "./transeuApi/trans-eu-api-app.service";
import {TransEuApiClientService} from "./transeuApi/trans-eu-api-client.service";
import {ExchangeRateService} from '../exchangeRate/exchange-rate.service';

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
        private readonly exchangeRateService: ExchangeRateService,
        private readonly transEuApiAppService: TransEuApiAppService,
        private readonly transEuApiClientService: TransEuApiClientService,
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
                driver: {
                    include: {
                        allowedCountries: true,
                    },
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
                orderBy:{
                    toDate: 'desc',
                }
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

        const allowedCountries = (car?.driver?.allowedCountries?.length) ? car.driver.allowedCountries.map(c => c.code) : [];

        const closeCities = await this.getClosestCities(
            plannedLocation.address.location[0],
            plannedLocation.address.location[1],
            numLoadingCities,
            allowedCountries
        );
        const furthestCities = await this.getFurthestCities(
            plannedLocation.address.location[0],
            plannedLocation.address.location[1],
            numUnloadingCities,
            allowedCountries
        );



        return {
            carSpecification: {
                type: car.vehicleTypes.map((vt) => vt.apiNameTimocom),
                body: car.bodies.map((bp) => bp.apiNameTimocom),
                bodyProperty: car.bodyProperties.map((bp) => bp.apiNameTimocom),
                equipment: car.vehicleEquipments.map((ve) => ve.apiNameTimocom),
                loadSecuring: [],//car.vehicleLoadSecurings.map((vls) => vls.apiNameTimocom),
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

    async getClosestCities(lat: number, lng: number, limit: number = 5, allowedCountries: string[] = []) {
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
            WHERE country IN (${allowedCountries.map(c => `'${c}'`).join(',')})
            ORDER BY distance ASC
            LIMIT ${limit};
        `);
    }

    async getFurthestCities(lat: number, lng: number, limit: number = 5,allowedCountries: string[] = []) {
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
            WHERE country IN (${allowedCountries.map(c => `'${c}'`).join(',')})
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
            plannedLocation: any;
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

        const uniqueOffers = this.removeDuplicateOffers(offers);

        const externalIds = uniqueOffers
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

        const offersWithStatus = uniqueOffers.map(offer => {
            const match = offer.id ? existingMap.get(offer.id) : null;
            return {
                ...offer,
                alreadySaved: !!match,
                savedOffer: match
            };
        });

        return this.sortOffers(offersWithStatus);
    }

    private async searchOffersBetweenTwoCities(
        start: any,
        end: any,
        carData: {
            carSpecification: CarSpecification;
            period: { startDate: Date | null; endDate: Date | null };
            plannedLocation: any
        },
        searchPeriodStartDate: Date,
        searchPeriodEndDate: Date,
        searchArea: number,
        page: number,
        limit: number,
    ): Promise<any[]> {
        const exclusiveLeftLowerBoundDateTime = new Date(searchPeriodStartDate);
        exclusiveLeftLowerBoundDateTime.setDate(exclusiveLeftLowerBoundDateTime.getDate() - 2);
        const inclusiveRightUpperBoundDateTime = new Date(searchPeriodEndDate);
        inclusiveRightUpperBoundDateTime.setDate(inclusiveRightUpperBoundDateTime.getDate() + 2);
        let plannedLocationDate = new Date(carData.plannedLocation.date);
        const dateNow =   new Date();
        if(plannedLocationDate < dateNow){
            plannedLocationDate = dateNow;
        }
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
                    latitude: start.latitude,
                    longitude: start.longitude,
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
                    latitude: end.latitude,
                    longitude: end.longitude,
                },
            },
            exclusiveLeftLowerBoundDateTime: exclusiveLeftLowerBoundDateTime.toISOString(),
            inclusiveRightUpperBoundDateTime: inclusiveRightUpperBoundDateTime.toISOString(),
            loadingDate: {
                objectType: "individualDates",
                dates: [
                    plannedLocationDate.toISOString().slice(0, 10)
                    // {
                    //     //dateTime: carData.period.startDate?.toISOString().slice(0, 10),
                    //     //dateTime: carData.plannedLocation.date.toISOString().slice(0, 10),
                    //     dateTime: '2025-05-27T00:00:00.000Z',
                    // },
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

        const partialTimocomOffers = await this.timocomApiService.fetchOffers(searchParams);
        const timocomOffers = await this.mapOffers(this.filterOffers(partialTimocomOffers?.data?.payload ?? []),
            carData.plannedLocation.address);
        console.log(timocomOffers.length, 'timocom offers found');

        const partialTransEuOffers = await this.transEuApiAppService.fetchOffers(searchParams);
        const transEuOffers = await this.mapOffers(this.filterOffers(partialTransEuOffers?.data?.payload ?? []),
            carData.plannedLocation.address);
        return [...timocomOffers, ...transEuOffers];
    }




    private removeDuplicateOffers(offers: any[]): any[] {
        const seen = new Set<string>();
        return offers.filter(offer => {
            if (!offer.id) return true; // zachowaj oferty bez externalId
            if (seen.has(offer.id)) return false;
            seen.add(offer.id);
            return true;
        });
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
    private async mapOffers(offers: any[], plannedLocation: { location: [number, number] }): Promise<any[]> {
        return Promise.all(offers.map(async offer => {
            const price = offer?.price?.amount;
            const distance = offer?.distance_km;


            const loading = offer.loadingPlaces.find((p) => p.loadingType === 'LOADING');
            const startLat = loading?.address?.geoCoordinate?.latitude;
            const startLng = loading?.address?.geoCoordinate?.longitude;

            let startAccessDistance = 0;
            if (typeof startLat === 'number' && typeof startLng === 'number') {
                startAccessDistance = Math.round( this.calculateDistance(
                    plannedLocation.location[0],
                    plannedLocation.location[1],
                    startLat,
                    startLng
                ));

            }

            const totalDistance = typeof distance === 'number' ? distance + startAccessDistance : null;

            let pricePerKm: number | null = null;
            let pricePerKmEur: number | null = null;
            let pricePerKmEurGross: number | null = null;


            if (typeof price === 'number' && typeof distance === 'number' && distance > 0) {
                pricePerKm = Number((price / distance).toFixed(2));
                const converted = await this.exchangeRateService.convertToEUR(price / distance, offer.price.currency);
                pricePerKmEur = Number((converted ?? 0).toFixed(2));
            }

            if (typeof price === 'number' && typeof totalDistance === 'number' && totalDistance > 0) {
                const convertedGross = await this.exchangeRateService.convertToEUR(price / totalDistance, offer.price.currency);
                pricePerKmEurGross = Number((convertedGross ?? 0).toFixed(2));
            }

            return {
                ...offer,
                pricePerKm,
                pricePerKmEur,
                startAccessDistance,
                totalDistance,
                pricePerKmEurGross
            };
        }));
    }


    private sortOffers(offers: any[]): any[] {
        return offers.sort((a, b) => {
            const priceA = parseFloat(a.pricePerKmEurGross);
            const priceB = parseFloat(b.pricePerKmEurGross);


            return  priceB - priceA;
        });
    }


    public testTransEuApiFetchFreights() {
        return this.transEuApiClientService.test();
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const ROUTE_MULTIPLIER = 1.3;
        const R = 6371; // promień Ziemi w kilometrach
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * ROUTE_MULTIPLIER;
    }

    private deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }


}
