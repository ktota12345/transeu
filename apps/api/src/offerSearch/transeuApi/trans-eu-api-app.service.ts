import { Injectable, Logger,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import axios from 'axios';


@Injectable()
export class TransEuApiAppService {
    private readonly logger = new Logger(TransEuApiAppService.name);
    private accessToken: string | null = null;
    private readonly MIN_DISTANCE = 200000;
    private readonly MAX_DISTANCE = 5000000;
    constructor(private prisma: PrismaService) {}

    private async getBearerToken(): Promise<string> {
        const tokenRecord = await this.prisma.transEuAppToken.findFirst({
            orderBy: { createdAt: 'desc' }, // najnowszy
        });

        if (!tokenRecord) {
            this.logger.warn('Brak tokenu Trans.eu w bazie danych.');
            return '';
        }

        const bufferMs = 30 * 1000; // bufor 30s
        const isExpired = new Date().getTime() + bufferMs >= tokenRecord.expiresAt.getTime();

        if (isExpired) {
            this.logger.warn('Token Trans.eu wygasł lub wkrótce wygaśnie.');
            return '';
        }

        return `Bearer ${tokenRecord.accessToken}`;
    }




    async fetchOffers(searchParams: any): Promise<any> {
        const baseUrl = 'https://api-platform.trans.eu/app/exchange/api/rest/v2/freight-offers';
        const bearerToken = await this.getBearerToken();
        const headers = {
            'Authorization': bearerToken,
            'Content-Type': 'application/json',
        };
        const loadingDateFrom = new Date(searchParams.loadingDate.dates[0]);
        const mappedParams = {
            filter: {
                loading_place: [
                    {
                         address: {
                             //country: ["47_poland"],
                             locality: searchParams.startLocation.area.address.city,
                             postal_code: searchParams.startLocation.area.address.postalCode
                         },
                        coordinates: {
                            latitude: searchParams.startLocation.area.latitude,
                            longitude: searchParams.startLocation.area.longitude,
                            range: searchParams.startLocation.area.range
                        }
                    }
                ],
                unloading_place: [
                    {
                        address: {
                            //country: ["47_poland"],
                            locality: searchParams.destinationLocation.area.address.city,
                            postal_code: searchParams.destinationLocation.area.address.postalCode
                        },
                        coordinates: {
                            latitude: searchParams.destinationLocation.area.latitude,
                            longitude: searchParams.destinationLocation.area.longitude,
                            range: searchParams.destinationLocation.area.range
                        }
                    }
                ],
                route_distance: {
                    from: this.MIN_DISTANCE,
                    to:     this.MAX_DISTANCE
                },
                price: {
                    from: 1
                },
                //price_currency: "1_eur",
                // required_ways_of_loading: ["1_top", "2_side", "3_back"],
                // available_ways_of_loading: ["1_top", "2_side", "3_back"],
                places_matching_type: "cross",
                exclude_suspended: true,
                 loading_date:{
                     from: loadingDateFrom.toISOString(),
                 }
            },
            sort: {
                field: "index",
                order: "desc"
            },
            counters: ["all"]
        };

        try {
            const res = await axios.get(baseUrl, {
                headers,
                params: mappedParams,
                paramsSerializer: params => {
                    return new URLSearchParams({
                        filter: JSON.stringify(params.filter),
                        sort: JSON.stringify(params.sort),
                        counters: JSON.stringify(params.counters)
                    }).toString();
                }
            });

            if (res.status >= 200 && res.status < 300 && res.data) {
                this.logger.log(`Otrzymano ${res.data?._embedded['freight-offers']?.length ?? 0} wyników z Trans.eu.`);
                const offers = res.data?._embedded['freight-offers']?.map((offer: any) => this.convertToTimocomOffer(offer)) || [];

                return { success: true, data:  {
                        payload:offers
                    }};
            } else {
                const msg = `Nieoczekiwany format odpowiedzi Trans.eu: ${res.status}`;
                this.logger.warn(msg);
                return { success: false, data: res.data, error: msg };
            }
        } catch (error) {
            this.logger.error('Błąd zapytania do Trans.eu:', error?.response?.data || error.message);
            //this.logger.warn('parametry:', searchParams);
            return this.handleError(error);
        }
    }

    private convertToTimocomOffer(offer: any): any {
        const freight = offer.freight || {};
        const spots = freight.spots || [];
        const requirements = freight.requirements || {};
        const route = freight.route || {};
        const price = offer.price || {};
        const period = freight.period || {};

        // Funkcja pomocnicza do tłumaczenia kodów krajów
        const getCountryCode = (country: string): string => {
            const map: { [key: string]: string } = {
                '47_poland': 'PL',
                '34_latvia': 'LV'
                // Dodaj inne kody krajów w razie potrzeby
            };
            return country;
        };

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
                    country: getCountryCode(address?.country),
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

        const distanceKm = route.distance ? Math.round(route.distance / 1000) : null;
        const amount = price.value || null;

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
                body: ["CURTAIN_SIDER"], // mapuj dynamicznie jeśli potrzeba
                bodyProperty: [],
                equipment: [],
                loadSecuring: [],
                swapBody: [],
                type: ["TRAILER", "WAGGON_AND_DRAG"], // można dodać logikę na podstawie vehicle_size
            },
            acceptQuotes: false,
            additionalInformation: [],
            distance_km: distanceKm,
            freightDescription: requirements.shipping_remarks || "standard",
            length_m: freight.loading_meters || null,
            loadingPlaces: spots.map(spot => {
                const opType = spot.operations?.[0]?.type || "loading";
                return convertSpot(spot, opType);
            }),
            paymentDueWithinDays: period.days || null,
            price: {
                amount: amount,
                currency: "EUR", // możesz dodać mapowanie: "1_eur" → "EUR"
            },
            weight_t: freight?.requirements?.transport?.total_weight || 10,
            pricePerKm: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            pricePerKmEur: distanceKm && amount ? +(amount / distanceKm).toFixed(2) : null,
            alreadySaved: false,
            sourceSystem:'transEU'
        };
    }


    private handleError(error: any): any {
        return {
            success: false,
            error: error?.response?.data || error.message || 'Nieznany błąd',
        };
    }


    // 2. Funkcja do wymiany code na access token
    async exchangeCodeForToken(code: string): Promise<void> {
        const clientId = process.env.TRANSEU_CLIENT_ID;
        const clientSecret = process.env.TRANSEU_CLIENT_SECRET;
        const redirectUri = process.env.TRANSEU_REDIRECT_URI || 'https://freightfusion.eu/tokenauthexchange';

        if (!clientId || !clientSecret) {
            throw new Error('Brak TRANSEU_CLIENT_ID lub TRANSEU_CLIENT_SECRET w zmiennych środowiskowych');
        }

        try {
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret,
            });

            const response = await axios.post(
                'https://api.platform.trans.eu/ext/auth-api/accounts/token',
                params.toString(),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'Api-key': process.env.TRANSEU_API_KEY || '',
                    },
                },
            );

            this.accessToken = response.data.access_token;
            this.logger.log('Pomyślnie uzyskano token dostępu z Trans.eu');
        } catch (error) {
            this.logger.error('Błąd wymiany kodu na token:', error?.response?.data || error.message);
            throw new Error('Nie udało się uzyskać tokenu dostępu');
        }
    }


}
