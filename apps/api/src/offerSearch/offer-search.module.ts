import {Module } from '@nestjs/common';
import {OfferSearchService} from './offer-search.service';
import {OfferSearchController} from './offer-search.controller';
import {PrismaModule} from '../prisma/prisma.module';
import {TimocomApiService} from './timocomApi/timocom-api.service';
import {TransEuApiAppService} from "./transeuApi/trans-eu-api-app.service";
import {TransEuApiClientService} from "./transeuApi/trans-eu-api-client.service";
import {ExchangeRateService} from '../exchangeRate/exchange-rate.service';
import {TransEuAuthService} from '../transeu-auth/trans-eu-auth.service';
import {TransEuHelperService} from './transeuApi/trans-eu-helper.service';
import {CostCalculationService} from "./costCalculation/cost-calculation.service";
import {TollGuruCostCalculationService} from "./costCalculation/tollguru-cost-calculation.service";
import {TomTomCostCalculationService} from "./costCalculation/tomtom-cost-calculation.service";

@Module({
    imports: [
        PrismaModule],
    controllers: [OfferSearchController],
    providers: [
        OfferSearchService,
        TimocomApiService,
        ExchangeRateService,
        TransEuApiAppService,
        TransEuApiClientService,
        TransEuAuthService,
        TransEuHelperService,
        CostCalculationService,
        TollGuruCostCalculationService,
        TomTomCostCalculationService,
    ],
})
export class OfferSearchModule {
}
