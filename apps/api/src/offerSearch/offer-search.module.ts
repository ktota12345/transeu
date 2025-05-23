import { Module } from '@nestjs/common';
import { OfferSearchService } from './offer-search.service';
import { OfferSearchController } from './offer-search.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { TimocomApiService } from './timocomApi/timocom-api.service';
import { ExchangeRateService } from '../exchangeRate/exchange-rate.service';
@Module({
    imports: [PrismaModule],
    controllers: [OfferSearchController],
    providers: [OfferSearchService, TimocomApiService, ExchangeRateService],
})
export class OfferSearchModule {}
