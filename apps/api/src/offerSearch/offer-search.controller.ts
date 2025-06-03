import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
    Res,
} from '@nestjs/common';
import { OfferSearchService} from "./offer-search.service";
import { TimocomApiService } from './timocomApi/timocom-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const SEARCH_AREA = 50;

@Controller('offerSearch')
//@UseGuards(JwtAuthGuard)
export class OfferSearchController {
    constructor(
        private readonly offerSearchService: OfferSearchService,
    ) {}
    @Get('car/:id')
    async car(
        @Param('id') id: string,
        @Query('numLoadingCities') numLoadingCities?: string,
        @Query('numUnloadingCities') numUnloadingCities?: string,
        @Query('searchArea') searchArea?: string,
        @Query('perPage') perPage?: string,
        @Query('plannedLocationOverride') plannedLocationOverride?: any,
        @Query('searchServices') searchServices?: string,
        @Query('useDestinationCityService') useDestinationCityService?: string,

    ) {
        const carData = await this.offerSearchService.getCarForSearch(parseInt(id),{
            numLoadingCities: numLoadingCities ? parseInt(numLoadingCities) : 0,
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
                const timeNow = new Date();
                    const body = {
                        latitude: carData.plannedLocation.address.location[0],
                        longitude: carData.plannedLocation.address.location[1],
                        banned_countries: carData.bannedCountries || [],
                        allowed_countries: carData.allowedCountries || [],
                    };
                    console.log("Ask for routing:",body);

                    const response = await fetch('http://routealgorithm.onrender.com/analyze-route', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });
                const routingResponseTimeS = (new Date().getTime() - timeNow.getTime()) / 1000;

                    const result = await response.json();
                console.log("routing result:", result, 'time:', routingResponseTimeS, 's');

                    const destinationCities = result.statistics?.destinations?.map((d) => ({
                        name: d.city,
                        latitude: d.latitude,
                        longitude: d.longitude,
                        country:d.country || 'DE',
                    })) || [];
                    console.log(result);

                    carData.furthestCities = destinationCities;
            } catch (error) {
                console.error('Błąd pobierania danych z analyze-route:', error);
            }
        }
        const servicesArray = searchServices
            ? JSON.parse(searchServices)
            : ['timocom', 'transEu', 'smartsearch'];
        const offers = await this.offerSearchService.searchOffersBetweenCities(carData, {
            searchArea: searchArea ? parseInt(searchArea) : SEARCH_AREA,
            perPage: perPage ? parseInt(perPage) : 100,
            searchServices: servicesArray,
        });
        //const offers = [];

        return { id, car: carData, offers };
    }







}
