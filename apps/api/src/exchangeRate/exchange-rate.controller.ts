import { Controller, Get, Query } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';

@Controller('exchange-rates')
export class ExchangeRateController {
    constructor(private readonly exchangeRateService: ExchangeRateService) {}

    @Get('sync')
    async syncRates() {
        return this.exchangeRateService.fetchAndStoreRates();
    }

    @Get()
    async getRate(@Query('currency') currency: string) {
        return this.exchangeRateService.getRate(currency);
    }
}
