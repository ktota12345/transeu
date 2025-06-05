import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TomTomCostCalculationService {
    private readonly logger = new Logger(TomTomCostCalculationService.name);
    private readonly tomtomApiKey = process.env.TOMTOM_API_KEY;

    async getTollCost(
        start: { lat: number; lng: number },
        end: { lat: number; lng: number },
    ): Promise<{ value: number | null; allInfo: any }> {
        // TomTom Routing API URL for toll cost estimation
        // Dokumentacja: https://developer.tomtom.com/routing-api/routing-api-documentation
        const url = 'https://api.tomtom.com/routing/1/calculateRoute/' +
            `${start.lat},${start.lng}:${end.lat},${end.lng}/json`;

        // Parametry:
        // vehicleHeading - nie jest konieczne
        // computeTravelTimeFor - 'all' albo 'truck' - tutaj truck
        // tollRoadCost - jeśli jest dostępne, ale w dokumentacji można wyciągnąć tollCosts z sekcji summary

        const params = {
            key: this.tomtomApiKey,
            travelMode: 'truck',
            vehicleCommercial: true,
            vehicleNumberOfAxles: 4,
            vehicleLength: 12.0, // metry
            vehicleWidth: 2.5,   // metry
            vehicleHeight: 3.8,  // metry
            vehicleWeight: 10000, // kg
            //vehicleLoadType: 'goods',
            vehicleAdrTunnelRestrictionCode: 'B',
            computeTravelTimeFor: 'all',
            includeTollPaymentTypes: 'all',
            report: 'effectiveSettings',
            sectionType: 'toll',

        };

        try {
            const response = await axios.get(url, { params });
            console.log(response.data.routes?.[0]); // Debugging output
            const route = response.data.routes?.[0];

            // W TomTom w summary może być sekcja tollCosts
            // np. route.summary.tollCosts.totalCosts.value (w domyślnej walucie, zwykle EUR)
            const tollCost = route?.summary?.tollCosts?.totalCosts?.value ?? null;

            return {
                value: tollCost,
                allInfo: response.data.routes,
            };
        } catch (error) {
            this.logger.error('Błąd podczas pobierania opłat z API TomTom', error?.response?.data || error.message);
            return {
                value: null,
                allInfo: null,
            };
        }
    }
}
