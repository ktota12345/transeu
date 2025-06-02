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
        const mappedParams = {
            filter: {
                loading_place:
                    {
                        address: {
                            country: searchParams.startLocation.area.address.country,
                            postal_code: searchParams.startLocation.area.address.postalCode
                        },
                        coordinates: {
                            latitude: searchParams.startLocation.area.latitude,
                            longitude: searchParams.startLocation.area.longitude
                        }
                    },
                unloading_place:
                    {
                        address: {
                            country: searchParams.destinationLocation.area.address.country,
                            postal_code: searchParams.destinationLocation.area.address.postalCode
                        },
                        coordinates: {
                            latitude: searchParams.destinationLocation.area.latitude,
                            longitude: searchParams.destinationLocation.area.longitude,
                            range: searchParams.destinationLocation.area.range
                        }
                    }
                ,

                required_truck_body: ["lorry","double_trailer","solo"],
                required_vehicle_size: ["bde"],
                transport_type: ["ftl"],
                load_weight: {
                    from: 1,
                    to: 99
                },
                minimal_rating: 0,
                is_quick_pay: false,
                // route_distance: {
                //     from: this.MIN_DISTANCE,
                //     to: this.MAX_DISTANCE
                // },
                // price: {
                //     from: 1
                // },
                // places_matching_type: "cross",
                // exclude_suspended: true,
                 loading_date: {
                     from: loadingDateFrom.toISOString(),
                 }
            },
        };
        //console.log(searchParams);
        try {
            const res = await axiosTranseu.get(baseUrl, {
                params: mappedParams,
                paramsSerializer: params => {
                    return new URLSearchParams({
                        filter: JSON.stringify(params.filter)
                    }).toString();
                }

            });

            if (res.status >= 200 && res.status < 300 && res.data) {
                //this.logger.log(`Otrzymano ${res.data?.offers?.length ?? 0} wyników ze SmartSearch.`);
                const offers = res.data?.offers?.map((offer: any) => this.transEuHelperService.convertToTimocomOffer(offer,'smartsearch')) || [];
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
}
