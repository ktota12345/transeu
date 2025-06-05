// src/offerSearch/costCalculation/cost-calculation.service.ts

import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {urlencoded} from "express";

@Injectable()
export class CostCalculationService {
    private readonly logger = new Logger(CostCalculationService.name);
    private readonly hereApiKey = process.env.HERE_API_KEY; // Upewnij się, że klucz API jest ustawiony w zmiennych środowiskowych

    async getTollCost(start: { lat: number; lng: number }, end: { lat: number; lng: number }): Promise<number | null> {
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
            const tollCost = response.data.routes?.[0].sections?.[0]?.summary?.tolls?.total?.value;
            return tollCost ?? null;
        } catch (error) {
            this.logger.error('Błąd podczas pobierania opłat drogowych z API Here', error);
            return null;
        }
    }
}
