import {Module} from '@nestjs/common';
import {OfferSearchService} from './offer-search.service';
import {OfferSearchController} from './offer-search.controller';
import {PrismaModule} from '../prisma/prisma.module';
import {TimocomApiService} from './timocomApi/timocom-api.service';
import {TransEuApiService} from "./transeuApi/trans-eu-api.service";
import {ExchangeRateService} from '../exchangeRate/exchange-rate.service';

@Module({
    imports: [PrismaModule],
    controllers: [OfferSearchController],
    providers: [OfferSearchService, TimocomApiService, ExchangeRateService,TransEuApiService],
})
export class OfferSearchModule {
}
