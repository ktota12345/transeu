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
    ) {
        const carData = await this.offerSearchService.getCarForSearch(parseInt(id),{
            numLoadingCities: numLoadingCities ? parseInt(numLoadingCities) : 0,
            numUnloadingCities: numUnloadingCities ? parseInt(numUnloadingCities) : 0,
        });

        const offers = await this.offerSearchService.searchOffersBetweenCities(carData, {
            searchArea: searchArea ? parseInt(searchArea) : SEARCH_AREA,
            perPage: perPage ? parseInt(perPage) : 100,
        });

        return { id, car: carData, offers };
    }

    @Get('transeu')
    async transeuOffers() {
        return this.offerSearchService.testTransEuApiFetchFreights();
    }


    @Get('tokenauthexchange')
    async handleTokenExchange(@Query('code') code: string, @Res() res: Response) {

        try {
            await this.offerSearchService.exchangeCodeForToken(code);
            return 'Token access został pomyślnie uzyskany i zapisany.';
        } catch (error) {
            return 'Błąd wymiany kodu na token.';
        }
    }





}
