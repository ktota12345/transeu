import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

import { TransEuHelperService } from './trans-eu-helper.service';
import axiosTranseu, { setupAxiosTranseu } from './axios-transeu';
import { TransEuAuthService } from '../../transeu-auth/trans-eu-auth.service';

@Injectable()
export class TransEuApiClientService implements OnModuleInit {
    private readonly MIN_PRICE = 100;
    private readonly logger = new Logger(TransEuApiClientService.name);
    private readonly cacheDir = path.resolve(__dirname, '../../../cache');
    private readonly ttlSeconds = 300; // 5 minut TTL

    constructor(
        private transEuAuthService: TransEuAuthService,
        private transEuHelperService: TransEuHelperService,
    ) {
        fs.mkdir(this.cacheDir, { recursive: true }).catch((err) => {
            this.logger.error('Nie udało się utworzyć folderu cache:', err.message);
        });
    }

    onModuleInit() {
        setupAxiosTranseu(this.transEuAuthService);
    }

    private async readCache(key: string): Promise<any | null> {
        const filePath = path.join(this.cacheDir, key + '.json');
        try {
            const stats = await fs.stat(filePath);
            const now = Date.now();
            const modified = stats.mtimeMs;

            if ((now - modified) / 1000 > this.ttlSeconds) {
                return null; // przeterminowany
            }

            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch {
            return null;
        }
    }

    private async writeCache(key: string, data: any): Promise<void> {
        const filePath = path.join(this.cacheDir, key + '.json');
        try {
            await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');
        } catch (err) {
            this.logger.warn(`Nie udało się zapisać cache: ${filePath}`, err.message);
        }
    }

    async fetchOffers(searchParams: any): Promise<any> {
        const hash = crypto.createHash('md5').update(JSON.stringify(searchParams)).digest('hex');
        const cacheKey = `transeu_${hash}`;

        const cached = await this.readCache(cacheKey);
        if (cached) {
            this.logger.debug(`Zwracam z lokalnego cache: ${cacheKey}`);
            //return cached;
        }

        const baseUrl = '/ext/offers-api/v2/offers';
        const loadingDateFrom = new Date(searchParams.loadingDate.dates[0]);
        const maxRange = 75;
        const searchRange = Math.min(searchParams.startLocation.area.size_km, maxRange);

        const mappedParams = {
            filter: {
                loading_place: {
                    address: {
                        country: searchParams.startLocation.area.address.country,
                        postal_code: searchParams.startLocation.area.address.postalCode,
                        range: searchRange,
                    },
                    coordinates: {
                        latitude: searchParams.startLocation.area.latitude,
                        longitude: searchParams.startLocation.area.longitude,
                        range: searchRange,
                    },
                },
                unloading_place: {
                    address: {
                        country: searchParams.destinationLocation.area.address.country,
                        postal_code: searchParams.destinationLocation.area.address.postalCode,
                        range: searchRange,
                    },
                    coordinates: {
                        latitude: searchParams.destinationLocation.area.latitude,
                        longitude: searchParams.destinationLocation.area.longitude,
                        range: searchRange,
                    },
                },
                required_vehicle_size: [searchParams.vehicleProperties.typeTransEu.join('_')],
                required_truck_body: [searchParams.vehicleProperties.bodyTransEu.join('_')],
                transport_type: ['ftl'],
                load_weight: { from: 1, to: 99 },
                minimal_rating: 0,
                price: { from: this.MIN_PRICE },
                loading_date: {
                    from: loadingDateFrom.toISOString(),
                },
            },
        };

        try {
            const res = await axiosTranseu.get(baseUrl, {
                params: mappedParams,
                paramsSerializer: (params) =>
                    new URLSearchParams({ filter: JSON.stringify(params.filter) }).toString(),
            });
            if (res.status >= 200 && res.status < 300 && res.data) {
                const offers = res.data?.offers?.map((offer: any) => this.convertToTimocomOffer(offer, 'smartsearch')) || [];
                const result = {
                    success: true,
                    data: { payload: offers }
                };

                await this.writeCache(cacheKey, result);
                this.logger.debug(`Zapisano do cache: ${cacheKey}`);

                return result;
            } else {
                const msg = `Nieoczekiwany format odpowiedzi SmartSearch: ${res.status}`;
                this.logger.warn(msg);
                return { success: false, data: res.data, error: msg };
            }
        } catch (error) {
            this.logger.error('Błąd zapytania do SmartSearch:', error?.response?.data || error.message);
            return this.handleError(error);
        }
    }

    private handleError(error: any): any {
        return {
            success: false,
            error: error?.response?.data || error.message || 'Nieznany błąd',
        };
    }

    private convertToTimocomOffer(offer: any, source: string): any {
        const freight = offer.freight || {};
        const spots = freight.spots || [];
        const requirements = freight.requirements || {};
        const route = freight.route || {};
        const price = offer.payment.price || {};
        const period = freight.period || {};

        const convertSpot = (spot: any, type: string) => {
            const address = spot.place.address;
            const coords = spot.place.coordinates;
            const operation = spot.operations?.[0];
            const beginDate = operation?.local_timespan?.begin?.substring(0, 10);
            const endDate = operation?.local_timespan?.end?.substring(0, 10);
            return {
                loadingType: type.toUpperCase(),
                address: {
                    objectType: 'address',
                    city: address?.locality || null,
                    country: address?.country.toUpperCase(),
                    geoCoordinate: {
                        longitude: coords?.longitude || null,
                        latitude: coords?.latitude || null,
                    },
                    geocoded: true,
                    postalCode: address?.postal_code || null,
                },
                startTime: null,
                endTime: null,
                earliestLoadingDate: beginDate || null,
                latestLoadingDate: endDate || null,
            };
        };

        const distanceKm = Math.round(this.transEuHelperService.calculateDistance(
            spots[0].place.coordinates.latitude,
            spots[0].place.coordinates.longitude,
            spots[1].place.coordinates.latitude,
            spots[1].place.coordinates.longitude,
        ));

        const amount = price.value || null;
        const currency = price.currency?.toUpperCase() || 'EUR';

        return {
            objectType: 'freightOffer',
            closedFreightExchangeSetting: null,
            contactPerson: null,
            creationDateTime: offer.created_at,
            customer: null,
            deeplink: `https://platform.trans.eu/exchange/offers?e1=offer.details.drawer&e1offerId=%22${offer.id}%22&e1offerType=%22loads%22`,
            excludedCustomers: [],
            id: offer.id,
            internalRemark: null,
            logisticsDocumentTypes: [],
            publicRemark: null,
            trackable: false,
            useMessenger: false,
            vehicleProperties: {
                body: [],
                bodyProperty: [],
                equipment: [],
                loadSecuring: [],
                swapBody: [],
                type: [],
            },
            acceptQuotes: false,
            additionalInformation: [],
            distance_km: distanceKm,
            freightDescription: requirements.shipping_remarks || '',
            length_m: freight.loading_meters || null,
            loadingPlaces: spots.map((spot) => {
                const opType = spot.operations?.[0]?.type || '';
                return convertSpot(spot, opType);
            }),
            paymentDueWithinDays: period.days || null,
            price: {
                amount: amount,
                currency: currency,
            },
            weight_t: freight?.requirements?.transport?.total_weight || 10,
            pricePerKm: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            pricePerKmEur: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            alreadySaved: false,
            sourceSystem: source,

            offerPublisher: {
                companyAddress: {
                    objectType: "postalAddress",
                    city: null,
                    country: null,
                    geoCoordinate: null,
                    geocoded: false,
                    postalCode: null,
                    streetOrPostbox: null,
                },
                creationDateTime: null,
                fax: null,
                id: null,
                name: offer.company?.legal_name || null,
                phone: null,
                postalAddress: null,
                taxId: offer.company?.vat_id || null,
                rating_summary: {
                    rating_average: offer.company?.rating_summary?.rating_average || null,
                    ratings_sender_companies_count: offer.company?.rating_summary?.ratings_sender_companies_count || null,
                },
                trans_risk:{
                    description: offer.company?.trans_risk?.description || null,
                    rating: offer.company?.trans_risk?.rating || null,
                    score: offer.company?.trans_risk?.score || null,
                }
            }
        };
    }
}
