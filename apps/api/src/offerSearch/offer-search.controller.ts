import {
    Controller,
    Get,
    Param,
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
    async car(@Param('id') id: string) {
        const carData = await this.offerSearchService.getCarForSearch(parseInt(id));

        const offers = await this.offerSearchService.searchOffersBetweenCities(carData);

        return { id, car: carData, offers };
    }




}
