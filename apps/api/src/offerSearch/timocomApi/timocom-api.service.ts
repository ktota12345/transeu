import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class TimocomApiService {
    private readonly logger = new Logger(TimocomApiService.name);
    private readonly client: AxiosInstance;

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
    }

    async fetchOffers(searchParams: any): Promise<any> {
        this.logger.debug('Wysyłam zapytanie do TIMOCOM /freight-offers/search', searchParams);
        try {
            const res = await this.client.post('/freight-offers/search', searchParams);
            if (res.status >= 200 && res.status < 300 && res.data) {
                this.logger.log(`Otrzymano ${res.data.payload?.length ?? 0} wyników z TIMOCOM.`);
                return { success: true, data: res.data };
            } else {
                const msg = `Nieoczekiwany format odpowiedzi TIMOCOM: ${res.status}`;
                this.logger.warn(msg);
                return { success: false, data: res.data, error: msg };
            }
        } catch (error) {
            this.logger.error('Błąd zapytania do TIMOCOM:', error?.response?.data || error.message);
            return this.handleError(error);
        }
    }

    async testConnection(): Promise<any> {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);

        const testPayload = {
            startLocation: {
                objectType: 'areaSearch',
                area: {
                    address: {
                        objectType: 'address',
                        city: 'Berlin',
                        postalCode: '10117',
                        country: 'DE',
                    },
                    size_km: 50,
                },
            },
            destinationLocation: {
                objectType: 'areaSearch',
                area: {
                    address: {
                        objectType: 'address',
                        city: 'München',
                        postalCode: '80331',
                        country: 'DE',
                    },
                    size_km: 50,
                },
            },
            inclusiveRightUpperBoundDateTime: tomorrow.toISOString(),
        };

        try {
            const res = await this.client.post('/freight-offers/search', testPayload);
            this.logger.log('Połączenie testowe do TIMOCOM powiodło się.');
            return { success: true, status: res.status, message: 'Połączenie działa', dataPreview: res.data?.payload?.[0] || null };
        } catch (error) {
            this.logger.error('Błąd testu połączenia z TIMOCOM:', error.message);
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
