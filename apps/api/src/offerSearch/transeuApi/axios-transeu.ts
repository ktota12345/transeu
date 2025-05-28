import axios, { AxiosHeaders } from 'axios';
import { TransEuAuthService } from '../../transeu-auth/trans-eu-auth.service';

const axiosTranseu = axios.create({
    baseURL: 'https://api.platform.trans.eu',
});

export const setupAxiosTranseu = (authService: TransEuAuthService) => {
    axiosTranseu.interceptors.request.use(async (config) => {
        const token = await authService.getValidToken();

        // Tworzymy nowy AxiosHeaders, jeśli oryginalny nie istnieje lub jest zwykłym obiektem
        if (!(config.headers instanceof AxiosHeaders)) {
            config.headers = new AxiosHeaders(config.headers);
        }

        (config.headers as AxiosHeaders).set('Authorization', `Bearer ${token}`);
        (config.headers as AxiosHeaders).set('Api-key', process.env.TRANSEU_API_KEY || '');


        return config;
    });

    axiosTranseu.interceptors.response.use(
        (res) => res,
        async (error) => {
            console.error('Trans.eu API error', error?.response?.status);
            return Promise.reject(error);
        },
    );
};

export default axiosTranseu;
