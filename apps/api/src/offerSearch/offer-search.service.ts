import {Injectable} from '@nestjs/common';
import {PrismaService} from '../prisma/prisma.service';
import {TimocomApiService} from './timocomApi/timocom-api.service';
import {TransEuApiAppService} from "./transeuApi/trans-eu-api-app.service";
import {TransEuApiClientService} from "./transeuApi/trans-eu-api-client.service";
import {ExchangeRateService} from '../exchangeRate/exchange-rate.service';
import {TransEuHelperService} from "./transeuApi/trans-eu-helper.service";

type CarSpecification = {
    type: string[];
    body: string[];
    typeTransEu: string[];
    bodyTransEu: string[];
    bodyProperty: string[];
    equipment: string[];
    loadSecuring: string[];
    swapBody: string[];
    carId: number;
};
type CityLocation = {
    name: string;
    postalCode: string;
    country: string;
    latitude: number;
    longitude: number;
};


@Injectable()
export class OfferSearchService {
    private readonly MIN_PRICE = 100;
    constructor(
        private prisma: PrismaService,
        private readonly timocomApiService: TimocomApiService,
        private readonly exchangeRateService: ExchangeRateService,
        private readonly transEuApiAppService: TransEuApiAppService,
        private readonly transEuApiClientService: TransEuApiClientService,
        private readonly transEuHelperService: TransEuHelperService,
    ) {
    }

    async getCarForSearch(carId: number, {
        numUnloadingCities = 1,
    }: {
        numUnloadingCities: number;
    }) {
        const now = new Date();

        const car = await this.prisma.car.findUnique({
            where: {
                id: carId,
            },
            include: {
                bodies: true,
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
                orderBy: {
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

        const allCountries = await this.prisma.country.findMany({
            select: {
                code: true,
            },
        }).then(countries => countries.map(c => c.code));

        const bannedCountries = allCountries.filter(c => !allowedCountries.includes(c));



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
                typeTransEu: car.vehicleTypes.flatMap((vt) => vt.transEuMapping || []),
                bodyTransEu: car.bodies.flatMap((bp) => bp.transEuMapping || []),
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
            furthestCities,
            bannedCountries,
            allowedCountries

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
            ORDER BY distance ASC
            LIMIT ${limit};
        `);
        //    #             WHERE country IN (${allowedCountries.map(c => `'${c}'`).join(',')})
    }

    async getFurthestCities(lat: number, lng: number, limit: number = 5, allowedCountries: string[] = []) {
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
            furthestCities: any[];
            plannedLocation: any;
        }, {
            searchArea,
            perPage,
            searchServices,
        }: {
            searchArea: number;
            perPage: number;
            searchServices: string[];
        },
    ) {
        const offers: any[] = [];

        const searchPeriodStartDate = new Date();
        const searchPeriodEndDate = new Date(searchPeriodStartDate.getTime() - 24 * 60 * 60 * 1000);

        for (const start of [
            {
                name:carData.plannedLocation.address.city,
                postalCode: carData.plannedLocation.address.postalCode,
                country: carData.plannedLocation.address.country,
                latitude: carData.plannedLocation.address.location[0],
                longitude: carData.plannedLocation.address.location[1],

            }]) {
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
                    searchServices
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
        start: CityLocation,
        end: CityLocation,
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
        searchServices: string[],
    ): Promise<any[]> {
        const exclusiveLeftLowerBoundDateTime = new Date(searchPeriodStartDate);
        exclusiveLeftLowerBoundDateTime.setDate(exclusiveLeftLowerBoundDateTime.getDate() - 2);
        const inclusiveRightUpperBoundDateTime = new Date(searchPeriodEndDate);
        inclusiveRightUpperBoundDateTime.setDate(inclusiveRightUpperBoundDateTime.getDate() + 2);
        let plannedLocationDate = new Date(carData.plannedLocation.date);
        const dateNow = new Date();
        if (plannedLocationDate < dateNow) {
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
                        country: end.country || 'DE',
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
                typeTransEu: carData.carSpecification.typeTransEu,
                bodyTransEu: carData.carSpecification.bodyTransEu,
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

        const allOffers: any[] = [];

        console.log(`
        Searching offers from ${start.name} (${start.country}) 
        to ${end.name} (${end.country}) 
        loading date: (${plannedLocationDate.toISOString().slice(0, 10)})
        search area: ${searchArea}km
        search services: ${searchServices.join(', ')}
        car type: ${carData.carSpecification.type.join(', ')}
        `);

        if (searchServices.includes('timocom')) {
            const partialTimocomOffers = await this.timocomApiService.fetchOffers(searchParams);
            const timocomOffers = await this.mapOffers(this.filterOffers(partialTimocomOffers?.data?.payload ?? []),
                carData.plannedLocation.address);
            if(partialTimocomOffers?.data?.payload.length > 0) {
                console.log(partialTimocomOffers?.data?.payload.length, 'timocom before filter offers found');
                console.log(timocomOffers.length, 'timocom after filter offers found');
            }
            allOffers.push(...timocomOffers);
        }
        if (searchServices.includes('transEu')) {
            const partialTransEuOffers = await this.transEuApiAppService.fetchOffers(searchParams);
            const transEuOffers = await this.mapOffers(this.filterOffers(partialTransEuOffers?.data?.payload ?? []),
                carData.plannedLocation.address);
            if (partialTransEuOffers?.data?.payload?.length > 0) {
                console.log(partialTransEuOffers?.data?.payload?.length, 'transEu before filter offers found');
                console.log(transEuOffers.length, 'transEu after filter offers found');
            }
            allOffers.push(...transEuOffers);
        }
        if (searchServices.includes('smartsearch')) {
            const partialTransEuSmartSearchOffers = await this.transEuApiClientService.fetchOffers(searchParams);
            const transEuSmartSearchOffers = await this.mapOffers(this.filterOffers(partialTransEuSmartSearchOffers?.data?.payload ?? []),
                carData.plannedLocation.address);
            if(partialTransEuSmartSearchOffers?.data?.payload?.length > 0) {
                console.log(partialTransEuSmartSearchOffers?.data?.payload?.length, 'smartsearch before filter offers found');
                console.log(transEuSmartSearchOffers.length, 'smartsearch after filter offers found');
            }
            allOffers.push(...transEuSmartSearchOffers);
        }


        return allOffers;
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
            offer.price.amount != null &&
            typeof offer.price.amount === 'number' &&
            offer.price.amount >= this.MIN_PRICE
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
                startAccessDistance = Math.round(this.transEuHelperService.calculateDistance(
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


            return priceB - priceA;
        });
    }




}
