import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class ExchangeRateService {
    private readonly logger = new Logger(ExchangeRateService.name);
    constructor(private readonly prisma: PrismaService) {}

    // Lista walut, które mogą nie być w tabeli A i trzeba pobrać osobno
    private fallbackCurrencies = ['HUF', 'BGN', 'RON'];

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async handleCron() {
        this.logger.log('🔁 Cron: Aktualizacja kursów walut...');
        await this.fetchAndStoreRates();
        this.logger.log('✅ Kursy zaktualizowane.');
    }
    // Sync: usuń wszystkie stare wpisy i zapisz tylko aktualne kursy (bez dat)
    async fetchAndStoreRates() {
        // Pobieramy tabelę A z NBP (aktualne kursy)
        const url = 'https://api.nbp.pl/api/exchangerates/tables/A/?format=json';

        const response = await axios.get(url);
        const data = response.data[0];
        const rates = data.rates;

        // Usuń wszystkie kursy z bazy przed zapisem nowych
        await this.prisma.exchangeRate.deleteMany();

        // Mapowanie kursów z tabeli A (bez daty)
        const entries = rates.map(rate => ({
            currency: rate.code,
            rate: rate.mid,
        }));

        // Zapisz kursy z tabeli A
        for (const entry of entries) {
            await this.prisma.exchangeRate.upsert({
                where: {
                    currency: entry.currency,
                },
                update: {
                    rate: entry.rate,
                },
                create: entry,
            });
        }

        // Sprawdź, których walut z fallbackCurrencies brakuje i pobierz je pojedynczo
        const existingCurrencies = entries.map(e => e.currency);
        const missingCurrencies = this.fallbackCurrencies.filter(c => !existingCurrencies.includes(c));

        for (const code of missingCurrencies) {
            try {
                const fallbackUrl = `https://api.nbp.pl/api/exchangerates/rates/A/${code}/?format=json`;

                const res = await axios.get(fallbackUrl);
                const rateData = res.data.rates[0];
                const entry = {
                    currency: code,
                    rate: rateData.mid,
                };

                await this.prisma.exchangeRate.upsert({
                    where: {
                        currency: entry.currency,
                    },
                    update: {
                        rate: entry.rate,
                    },
                    create: entry,
                });
            } catch (err) {
                console.warn(`Brak danych dla waluty ${code}:`, err.message);
            }
        }

        // Zwróć aktualne kursy z bazy
        return this.prisma.exchangeRate.findMany();
    }

    // Pobierz kurs dla waluty (bez daty)
    async getRate(currency: string) {
        return this.prisma.exchangeRate.findUnique({
            where: {
                currency,
            },
        });
    }

    // Przelicz kwotę z dowolnej waluty na EUR
    async convertToEUR(amount: number, currency: string): Promise<number | null> {
        if (currency === 'EUR') return amount;

        const eurRateEntry = await this.getRate('EUR');
        if (!eurRateEntry) {
            console.warn(`Brak kursu EUR`);
            return 0;
        }
        const eurToPln = eurRateEntry?.rate ?? 0;

        if (currency === 'PLN') {
            return amount / eurToPln;
        }

        const rateEntry = await this.getRate(currency);
        if (!rateEntry) {
            console.warn(`Brak kursu dla waluty ${currency}`);
            return null;
        }
        const rateToPln = rateEntry?.rate ?? 0;

        const amountInPln = amount * rateToPln;
        return amountInPln / eurToPln;
    }
}
