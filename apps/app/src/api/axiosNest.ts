import axios from 'axios';

//const NEST_API_URL = 'https://transeu-dev.onrender.com/';//process.env.REACT_APP_NEST_API_URL || 'http://localhost:3001';

const NEST_API_URL = process.env.REACT_APP_NEST_API_URL || 'https://transeu-dev.onrender.com';


const axiosNest = axios.create({
    baseURL: NEST_API_URL,
});

// REQUEST interceptor — dodawanie tokena
axiosNest.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// RESPONSE interceptor — odświeżanie tokena przy 401
axiosNest.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) throw new Error('Brak refresh tokena');

                const res = await axios.post(`${NEST_API_URL}/auth/refresh`, {
                    refreshToken,
                });

                const { access_token } = res.data;

                localStorage.setItem('token', access_token);

                // Zaktualizuj nagłówki
                axiosNest.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
                originalRequest.headers['Authorization'] = `Bearer ${access_token}`;

                return axiosNest(originalRequest);
            } catch (refreshError) {
                console.error('Błąd odświeżania tokena', refreshError);
                localStorage.removeItem('token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axiosNest;
