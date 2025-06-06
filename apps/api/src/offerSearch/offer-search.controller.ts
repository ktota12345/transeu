import {
    Controller,
    Param,
    Query,
    Sse,
    MessageEvent,
} from '@nestjs/common';
import { Observable, Subject } from 'rxjs';
import { OfferSearchService } from './offer-search.service';

const SEARCH_AREA = 50;

@Controller('offerSearch')
export class OfferSearchController {
    constructor(
        private readonly offerSearchService: OfferSearchService,
    ) {}

    @Sse('car/:id')
    async car(
        @Param('id') id: string,
        @Query('numUnloadingCities') numUnloadingCities?: string,
        @Query('searchArea') searchArea?: string,
        @Query('perPage') perPage?: string,
        @Query('plannedLocationOverride') plannedLocationOverride?: any,
        @Query('searchServices') searchServices?: string,
        @Query('useDestinationCityService') useDestinationCityService?: string,
    ): Promise<Observable<MessageEvent>> {
        const progress$ = new Subject<MessageEvent>();

        const carData = await this.offerSearchService.getCarForSearch(parseInt(id), {
            numUnloadingCities: numUnloadingCities ? parseInt(numUnloadingCities) : 0,
        });

        const plannedLocationOverrideParsed = plannedLocationOverride ? JSON.parse(plannedLocationOverride) : null;

        if (plannedLocationOverrideParsed?.lat && plannedLocationOverrideParsed?.lng && plannedLocationOverrideParsed?.date) {
            carData.plannedLocation = {
                latitude: parseFloat(plannedLocationOverrideParsed.lat),
                longitude: parseFloat(plannedLocationOverrideParsed.lng),
                date: new Date(plannedLocationOverrideParsed.date),
                address: plannedLocationOverrideParsed.address || '',
            };
        }

        if (useDestinationCityService === '1') {
            try {
                const body = {
                    latitude: carData.plannedLocation.address.location[0],
                    longitude: carData.plannedLocation.address.location[1],
                    banned_countries: carData.bannedCountries || [],
                    allowed_countries: carData.allowedCountries || [],
                };

                const response = await fetch('http://routealgorithm.onrender.com/analyze-route', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });

                const result = await response.json();

                const destinationCities = result.statistics?.destinations?.map((d) => ({
                    name: d.city,
                    latitude: d.latitude,
                    longitude: d.longitude,
                    country: d.country || 'DE',
                })) || [];

                carData.furthestCities = destinationCities;
            } catch (error) {
                progress$.next({ data: { error: 'Błąd pobierania danych z analyze-route' } });
                progress$.complete();
                return progress$;
            }
        }

        const servicesArray = searchServices
            ? JSON.parse(searchServices)
            : ['timocom', 'transEu', 'smartsearch'];

        this.offerSearchService
            .searchOffersBetweenCities(
                carData,
                {
                    searchArea: searchArea ? parseInt(searchArea) : SEARCH_AREA,
                    perPage: perPage ? parseInt(perPage) : 100,
                    searchServices: servicesArray,
                },
                (progress) => {
                    progress$.next({ data: progress }); // <- tu leci każda para miast
                },
            )
            .then((offers) => {
                progress$.next({ data: { done: true, offers, car: carData } });
                progress$.complete();
            })
            .catch((err) => {
                progress$.error(err);
            });

        return progress$.asObservable();
    }
}
