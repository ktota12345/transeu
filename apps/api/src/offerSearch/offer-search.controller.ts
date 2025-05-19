import {
    Controller,
    Get,
    Param,
    UseGuards,
} from '@nestjs/common';
import { OfferSearchService} from "./offer-search.service";
import { TimocomApiService } from './timocomApi/timocom-api.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('offerSearch')
@UseGuards(JwtAuthGuard)
export class OfferSearchController {
    constructor(
        private readonly offerSearchService: OfferSearchService,
        private readonly timocomApiService: TimocomApiService
    ) {}
    @Get('car/:id')
    @Get('car/:id')
    async car(@Param('id') id: string) {
        // przykładowe parametry wyszukiwania dla oferty frachtowej
        const searchParams = {
            // miejsce załadunku (tu: Warszawa, do 50 km wokół)
            startLocation: {
                objectType: 'areaSearch',
                area: {
                    address: {
                        objectType: 'address',
                        country: 'PL',
                        postalCode: '00-001',
                        city: 'Warszawa',
                    },
                    size_km: 50,
                },
            },
            // miejsce rozładunku (tu: Berlin, do 100 km wokół)
            destinationLocation: {
                objectType: 'areaSearch',
                area: {
                    address: {
                        objectType: 'address',
                        country: 'DE',
                        postalCode: '10115',
                        city: 'Berlin',
                    },
                    size_km: 100,
                },
            },
            // zakres dat (od wczoraj do jutra)
            exclusiveLeftLowerBoundDateTime: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            inclusiveRightUpperBoundDateTime: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
            // dodatkowe filtry (opcjonalne)
            vehicleTypeCodes: ['truck', 'semiTrailer'],
            // paginacja
            paging: {
                page: 1,
                limit: 20,
            },
        };

        const offers = await this.timocomApiService.fetchOffers(searchParams);
        return { id, offers };
    }




}
