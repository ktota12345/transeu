import { Inject, Injectable, Logger } from '@nestjs/common';

import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TimocomApiService {
    private readonly logger = new Logger(TimocomApiService.name);
    private readonly client: AxiosInstance;

    constructor(
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) {
        const username = process.env.TIMOCOM_USERNAME;
        const password = process.env.TIMOCOM_PASSWORD;
        const baseURL = process.env.TIMOCOM_API_URL || 'https://api.timocom.com';

        this.client = axios.create({
            baseURL: `${baseURL}/freight-exchange/3`,
            timeout: 15000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.client.interceptors.request.use((config) => {
            if (username && password) {
                const credentials = Buffer.from(`${username}:${password}`).toString('base64');
                config.headers['Authorization'] = `Basic ${credentials}`;
            } else {
                this.logger.warn('Brak danych logowania do TIMOCOM.');
            }
            return config;
        });
    }

    async fetchOffers(searchParams: any): Promise<any> {
        const cacheKey = `timocom:${JSON.stringify(searchParams)}`;
        const cached = await this.cacheManager.get(cacheKey);

        if (cached) {
            this.logger.debug(`Zwracam z cache dla klucza: ${cacheKey}`);
            return cached;
        }

        try {
            const limit = searchParams.paging?.limit ?? 30;
            const perPage = 30; // Timocom max na stronę
            const allOffers: any[] = [];
            let page = 1;

            while (allOffers.length < limit) {
                const pagedParams = {
                    ...searchParams,
                    paging: {
                        ...searchParams.paging,
                        page,
                        limit: perPage
                    }
                };

                const res = await this.client.post('/freight-offers/search', pagedParams);

                if (res.status >= 200 && res.status < 300 && res.data) {
                    const offers = res.data?.payload ?? [];
                    allOffers.push(...offers);

                    if (offers.length < perPage) {
                        break; // mniej niż maks na stronę -> koniec wyników
                    }
                } else {
                    const msg = `Nieoczekiwany format odpowiedzi TIMOCOM: ${res.status}`;
                    this.logger.warn(msg);
                    break;
                }

                page++;
            }

            const result = {
                success: true,
                data: {
                    payload: allOffers.slice(0, limit)
                }
            };

            await this.cacheManager.set(cacheKey, result, 3000); // TTL 5 minut (w sekundach)
            this.logger.debug(`Dodano do cache: ${cacheKey}`);

            const cached = await this.cacheManager.get(cacheKey);
            return cached;



            return result;

        } catch (error) {
            this.logger.error('Błąd zapytania do TIMOCOM:', error?.response?.data || error.message);
            this.logger.warn('parametry:', searchParams);
            return this.handleError(error);
        }
    }

    private handleError(error: any) {
        const response = error.response;
        if (response) {
            const { status, data } = response;
            return {
                success: false,
                status,
                error: data?.title || data?.message || 'Błąd zapytania',
                details: data,
            };
        } else {
            return {
                success: false,
                status: 500,
                error: error.message || 'Nieznany błąd połączenia',
            };
        }
    }
}
