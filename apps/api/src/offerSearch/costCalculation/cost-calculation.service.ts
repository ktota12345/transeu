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
        end: { lat: number; lng: number }
    ): Promise<{ value: number | null, allInfo: any }> {
        const sixMonthsAgo = subMonths(new Date(), 6);

        // Zaokrąglone współrzędne (~5 km)
        const roundedStartLat = this.roundCoord(start.lat);
        const roundedStartLng = this.roundCoord(start.lng);
        const roundedEndLat = this.roundCoord(end.lat);
        const roundedEndLng = this.roundCoord(end.lng);

        // Sprawdź cache
        const cached = await this.prisma.tollCostCache.findFirst({
            where: {
                startLat: roundedStartLat,
                startLng: roundedStartLng,
                endLat: roundedEndLat,
                endLng: roundedEndLng,
                createdAt: { gte: sixMonthsAgo }
            }
        });

        if (cached) {
            //this.logger.log('Zwracam wynik z cache (zaokrąglony)');
            return {
                value: cached.costValue ?? null,
                allInfo: cached.allInfo
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
            'tolls[vignettes]': 'all',
            currency: 'EUR',
        };

        try {
            const response = await axios.get(url, { params });
            const tollCost = response.data.routes?.[0].sections?.[0]?.summary?.tolls?.total?.value || 0;

            // Zapisz do cache z zaokrąglonymi współrzędnymi
            await this.prisma.tollCostCache.create({
                data: {
                    startLat: roundedStartLat,
                    startLng: roundedStartLng,
                    endLat: roundedEndLat,
                    endLng: roundedEndLng,
                    costValue: tollCost,
                    allInfo: response.data
                }
            });

            return {
                value: tollCost,
                allInfo: response.data
            };

        } catch (error) {
            this.logger.error('Błąd podczas pobierania opłat drogowych z API Here', error);
            return {
                value: null,
                allInfo: null
            };
        }
    }
}
