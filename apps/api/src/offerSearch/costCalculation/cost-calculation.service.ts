import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { subMonths } from 'date-fns';

@Injectable()
export class CostCalculationService {
    private readonly logger = new Logger(CostCalculationService.name);
    private readonly hereApiKey = process.env.HERE_API_KEY;

    constructor(private readonly prisma: PrismaService) {}

    // Zaokrąglenie do określonej precyzji (ok. 5 km ~ 0.05 stopnia)
    private roundCoord(coord: number, precision = 0.05): number {
        return Math.round(coord / precision) * precision;
    }

    async getTollCost(
        start: { lat: number; lng: number },
        end: { lat: number; lng: number },
        excludeCountries?: string[] | null
    ): Promise<{
        value: number | null,
        allInfo: any,
        distance: number | null,
        duration: number | null,
        baseDuration: number | null
    }> {
        const sixMonthsAgo = subMonths(new Date(), 6);

        // Zaokrąglone współrzędne (~5 km)
        const roundedStartLat = this.roundCoord(start.lat);
        const roundedStartLng = this.roundCoord(start.lng);
        const roundedEndLat = this.roundCoord(end.lat);
        const roundedEndLng = this.roundCoord(end.lng);

        const where = {
            startLat: roundedStartLat,
            startLng: roundedStartLng,
            endLat: roundedEndLat,
            endLng: roundedEndLng,
            createdAt: { gte: sixMonthsAgo }
        };
        if (excludeCountries) {
            where['excludeCountries'] = { hasEvery: excludeCountries };
        }
        // Sprawdź cache
        const cached = await this.prisma.tollCostCache.findFirst({
            where: where
        });

        if (cached) {
            this.logger.log('Zwracam wynik z cache (zaokrąglony)');
            return {
                value: cached.costValue,
                allInfo: cached.allInfo,
                distance: cached.distance,
                duration: cached.duration,
                baseDuration: cached.baseDuration
            };
        }

        // Jeśli nie ma w cache, pobierz z API
        const url = 'https://router.hereapi.com/v8/routes';
        const params = {
            transportMode: 'truck',
            origin: `${start.lat},${start.lng}`,
            destination: `${end.lat},${end.lng}`,
            return: 'summary,tolls',
            apiKey: this.hereApiKey,
            'tolls[summaries]': 'total',
            //'tolls[vignettes]': 'all',
            currency: 'EUR',
        };
        if (excludeCountries && excludeCountries.length > 0) {
                params['exclude[countries]'] = excludeCountries.join(',');
        }


        try {
            const response = await axios.get(url, { params });
            if(!response.data.routes?.[0]){
                this.logger.warn('Brak danych w odpowiedzi z API Here', response.data, params);
                return {
                    value: null,
                    distance: null,
                    duration: null,
                    baseDuration: null,
                    allInfo: null
                };
            }
            const tollCost = response.data.routes?.[0].sections?.[0]?.summary?.tolls?.total?.value || 0;
            const distance = response.data.routes?.[0].sections?.[0]?.summary?.length || 0;
            const duration = response.data.routes?.[0].sections?.[0]?.summary?.duration || 0;
            const baseDuration = response.data.routes?.[0].sections?.[0]?.summary?.baseDuration || 0;

            // Zapisz do cache z zaokrąglonymi współrzędnymi
            await this.prisma.tollCostCache.create({
                data: {
                    startLat: roundedStartLat,
                    startLng: roundedStartLng,
                    endLat: roundedEndLat,
                    endLng: roundedEndLng,
                    costValue: tollCost,
                    allInfo: response.data,
                    excludeCountries: excludeCountries || [],
                    distance: distance,
                    duration: duration,
                    baseDuration: baseDuration,
                }
            });

            return {
                value: tollCost,
                distance: distance,
                duration: duration,
                baseDuration: baseDuration,
                allInfo: response.data
            };

        } catch (error) {
            this.logger.error('Błąd podczas pobierania opłat drogowych z API Here', error);
            this.logger.warn('Params', params);


            return {
                value: null,
                distance: null,
                duration: null,
                baseDuration: null,
                allInfo: null
            };
        }
    }
}
