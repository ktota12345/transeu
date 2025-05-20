import {
    Controller,
    Get,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { OfferSearchService} from "./offer-search.service";
import { TimocomApiService } from './timocomApi/timocom-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const SEARCH_AREA = 50;

@Controller('offerSearch')
@UseGuards(JwtAuthGuard)
export class OfferSearchController {
    constructor(
        private readonly offerSearchService: OfferSearchService,
        private readonly timocomApiService: TimocomApiService
    ) {}
    @Get('car/:id')
    async car(
        @Param('id') id: string,
        @Query('numLoadingCities') numLoadingCities?: string,
        @Query('numUnloadingCities') numUnloadingCities?: string,
        @Query('searchArea') searchArea?: string,
        @Query('perPage') perPage?: string,
    ) {
        const carData = await this.offerSearchService.getCarForSearch(parseInt(id),{
            numLoadingCities: numLoadingCities ? parseInt(numLoadingCities) : 0,
            numUnloadingCities: numUnloadingCities ? parseInt(numUnloadingCities) : 0,
        });

        // Przekaż query params do serwisu (np. konwertując na number)
        const offers = await this.offerSearchService.searchOffersBetweenCities(carData, {
            searchArea: searchArea ? parseInt(searchArea) : SEARCH_AREA,
            perPage: perPage ? parseInt(perPage) : 100,
        });

        return { id, car: carData, offers };
    }





}
