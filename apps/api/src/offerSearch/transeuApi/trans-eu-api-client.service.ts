import {Injectable, Logger, OnModuleInit} from '@nestjs/common';
import {TransEuHelperService} from "./trans-eu-helper.service";

import axiosTranseu, {setupAxiosTranseu} from './axios-transeu';
import {TransEuAuthService} from '../../transeu-auth/trans-eu-auth.service';

@Injectable()
export class TransEuApiClientService implements OnModuleInit {
    private readonly MIN_DISTANCE = 200000;
    private readonly MAX_DISTANCE = 5000000;
    private readonly logger = new Logger(TransEuApiClientService.name);

    constructor(
        private transEuAuthService: TransEuAuthService,
        private transEuHelperService: TransEuHelperService
    ) {
    }

    onModuleInit() {
        setupAxiosTranseu(this.transEuAuthService);
    }


    async fetchOffers(searchParams: any): Promise<any> {
        const baseUrl = '/ext/offers-api/v2/offers';
        const loadingDateFrom = new Date(searchParams.loadingDate.dates[0]);
        const maxRange = 75;
        const searchRange = searchParams.startLocation.area.size_km > maxRange ? maxRange : searchParams.startLocation.area.size_km;
        const mappedParams = {
            filter: {
                loading_place:
                    {
                        address: {
                            country: searchParams.startLocation.area.address.country,
                            postal_code: searchParams.startLocation.area.address.postalCode,
                            range:searchRange
                        },
                        coordinates: {
                            latitude: searchParams.startLocation.area.latitude,
                            longitude: searchParams.startLocation.area.longitude,
                            range:searchRange
                        },
                    },
                unloading_place:
                    {
                        address: {
                            country: searchParams.destinationLocation.area.address.country,
                            postal_code: searchParams.destinationLocation.area.address.postalCode,
                            range:searchRange
                        },
                        coordinates: {
                            latitude: searchParams.destinationLocation.area.latitude,
                            longitude: searchParams.destinationLocation.area.longitude,
                            range:searchRange,
                        },
                    }
                ,

                required_vehicle_size: [searchParams.vehicleProperties.typeTransEu.join('_')],
                required_truck_body: [searchParams.vehicleProperties.bodyTransEu.join('_')],
                transport_type: ["ftl"],
                load_weight: {
                    from: 1,
                    to: 99
                },
                minimal_rating: 0,
                //is_quick_pay: true,
                // route_distance: {
                //     from: this.MIN_DISTANCE,
                //     to: this.MAX_DISTANCE
                // },
                 price: {
                     from: 1
                 },
                // places_matching_type: "cross",
                // exclude_suspended: true,
                 loading_date: {
                     from: loadingDateFrom.toISOString(),
                     //to: "2026-01-01T00:00:00Z" // Ustawiamy na przyszłość, aby nie ograniczać daty
                 }
            },
        };
        try {
            const res = await axiosTranseu.get(baseUrl, {
                params: mappedParams,
                paramsSerializer: params => {
                    return new URLSearchParams({
                        filter: JSON.stringify(params.filter)
                    }).toString();
                }

            });
            console.log(JSON.stringify(mappedParams.filter), null, 2);

            if (res.status >= 200 && res.status < 300 && res.data) {
                //this.logger.log(`Otrzymano ${res.data?.offers?.length ?? 0} wyników ze SmartSearch.`);
                const offers = res.data?.offers?.map((offer: any) => this.convertToTimocomOffer(offer,'smartsearch')) || [];
                return {
                    success: true, data: {
                        payload: offers
                    }
                };
            } else {
                const msg = `Nieoczekiwany format odpowiedzi SmartSearch: ${res.status}`;
                this.logger.warn(msg);
                return {success: false, data: res.data, error: msg};
            }
        } catch (error) {
            this.logger.error('Błąd zapytania do SmartSearch:', error?.response?.data || error.message);
            //this.logger.warn('parametry:', searchParams);
            return this.handleError(error);
        }
    }

    private handleError(error: any): any {
        return {
            success: false,
            error: error?.response?.data || error.message || 'Nieznany błąd',
        };
    }



    private  convertToTimocomOffer(offer: any, source): any {
        const freight = offer.freight || {};
        const spots = freight.spots || [];
        const requirements = freight.requirements || {};
        const route = freight.route || {};
        const price = offer.payment.price || {};
        const period = freight.period || {};


        // Funkcja do mapowania miejsc (załadunku/rozładunku)
        const convertSpot = (spot: any, type: string) => {
            const address = spot.place.address;
            const coords = spot.place.coordinates;
            const operation = spot.operations?.[0];
            const beginDate = operation?.local_timespan?.begin?.substring(0, 10);
            const endDate = operation?.local_timespan?.end?.substring(0, 10);

            return {
                loadingType: type.toUpperCase(),
                address: {
                    objectType: "address",
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

        //const distanceKm = route.distance ? Math.round(route.distance / 1000) : null;
        const distanceKm = Math.round(this.transEuHelperService.calculateDistance(
            spots[0].place.coordinates.latitude,
            spots[0].place.coordinates.longitude,
            spots[1].place.coordinates.latitude,
            spots[1].place.coordinates.longitude
        ));

        const amount = price.value || null;
        const currency = price.currency.toUpperCase() || 'EUR';

        return {
            objectType: "freightOffer",
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
            freightDescription: requirements.shipping_remarks || "",
            length_m: freight.loading_meters || null,
            loadingPlaces: spots.map(spot => {
                const opType = spot.operations?.[0]?.type || "";
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
            sourceSystem: source
        };
    }
}
