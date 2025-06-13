import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class TimocomApiService {
    private readonly logger = new Logger(TimocomApiService.name);
    private readonly client: AxiosInstance;
    private readonly cacheDir = path.resolve(__dirname, '../../../cache');
    private readonly ttlSeconds = 300; // 5 minut

    constructor() {
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

        // utwórz katalog cache jeśli nie istnieje
        fs.mkdir(this.cacheDir, { recursive: true }).catch((err) => {
            this.logger.error('Nie można utworzyć katalogu cache:', err.message);
        });
    }

    private async readCache(key: string): Promise<any | null> {
        const filePath = path.join(this.cacheDir, key + '.json');

        try {
            const stats = await fs.stat(filePath);
            const now = Date.now();
            const modified = stats.mtimeMs;

            if ((now - modified) / 1000 > this.ttlSeconds) {
                return null; // cache przeterminowany
            }

            const content = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        } catch (err) {
            return null; // brak pliku lub błąd odczytu
        }
    }

    private async writeCache(key: string, data: any): Promise<void> {
        const filePath = path.join(this.cacheDir, key + '.json');
        try {
            await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');
        } catch (err) {
            this.logger.warn(`Nie udało się zapisać cache: ${filePath}`, err.message);
        }
    }

    async fetchOffers(searchParams: any): Promise<any> {
        const hash = crypto.createHash('md5').update(JSON.stringify(searchParams)).digest('hex');
        const cacheKey = `timocom_${hash}`;

        const cached = await this.readCache(cacheKey);
        if (cached) {
            this.logger.debug(`Zwracam z lokalnego cache: ${cacheKey}`);
            return cached;
        }

        try {
            const limit = searchParams.paging?.limit ?? 30;
            const perPage = 30;
            const allOffers: any[] = [];
            let page = 1;

            while (allOffers.length < limit) {
                const pagedParams = {
                    ...searchParams,
                    paging: { ...searchParams.paging, page, limit: perPage }
                };

                const res = await this.client.post('/freight-offers/search', pagedParams);

                if (res.status >= 200 && res.status < 300 && res.data) {
                    const offers = res.data?.payload ?? [];
                    allOffers.push(...offers);

                    if (offers.length < perPage) break;
                } else {
                    this.logger.warn(`Nieoczekiwany status: ${res.status}`);
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

            await this.writeCache(cacheKey, result);
            return result;

        } catch (error) {
            this.logger.error('Błąd zapytania do TIMOCOM:', error?.response?.data || error.message);
            return this.handleError(error);
        }
    }


    async getSingleOffer(offerId: string): Promise<any> {
        try {
            const res = await this.client.get('/freight-offers', {
                params: { ids: offerId }
            });
            return res.data.payload?.[0] ?? null;
        } catch (e) {
            this.logger.error('Błąd getSingleOffer:', e.response?.data || e.message);
            return this.handleError(e);
        }
    }


    async getOfferPublisherByOfferId(offerId: string): Promise<any> {
        const offer = await this.getSingleOffer(offerId);
        if (!offer) return null;
        return offer.customer || null;
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
