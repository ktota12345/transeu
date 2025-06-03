
import {Injectable} from "@nestjs/common";

@Injectable()
export class TransEuHelperService {

    public  convertToTimocomOffer(offer: any, source): any {
        const freight = offer.freight || {};
        const spots = freight.spots || [];
        const requirements = freight.requirements || {};
        const route = freight.route || {};
        const price = offer.price || {};
        const period = freight.period || {};

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
            sourceSystem: source
        };
    }


    public calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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