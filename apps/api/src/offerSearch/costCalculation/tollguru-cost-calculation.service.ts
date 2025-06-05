import {Injectable, Logger} from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class TollGuruCostCalculationService {
    private readonly logger = new Logger(TollGuruCostCalculationService.name);
    private readonly tollGuruApiKey = process.env.TOLLGURU_API_KEY;

    async getTollCost(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<{ value: number | null, allInfo: any }> {
        const url = 'https://apis.tollguru.com/toll/v2/origin-destination-waypoints';



        const data = {
            from:{lat: start.lat, lng: start.lng}
            ,
            to:
                {lat: end.lat, lng: end.lng}
            ,
            waypoints: [],
            vehicle: {
                type: "4AxlesTruck"
            },
            units: "EUR"
        };


        const headers = {
            'x-api-key': this.tollGuruApiKey,
            'Content-Type': 'application/json'
        };
        try {
            const response = await axios.post(url, data, {headers});
            const tollCost = response.data.routes[0].costs?.tagAndCash || 0;
            return {
                value: tollCost,
                allInfo: response.data.routes[0]
            };
        } catch (error) {
            this.logger.error('Błąd podczas pobierania opłat z TollGuru API', error?.response?.data || error.message);
            return {
                value: null,
                allInfo: null
            };

        }
    }
}
