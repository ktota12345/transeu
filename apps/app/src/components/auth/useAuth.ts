import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode';
import axiosNest from '../../api/axiosNest';

type LoginInput = {
    email: string;
    password: string;
};

export const useAuth = () => {
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const login = useCallback(async (credentials: LoginInput) => {
        setLoading(true);
        try {
            /*
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials),
            });

             */
            const res = await axiosNest.post('auth/login', credentials);
            console.log(res);

            //if (!res.ok) throw new Error('Nieprawidłowy login lub hasło');
            if (res.status !== 201) throw new Error('Nieprawidłowy login lub hasło');

            //const data = await res.json();
            const data = res.data;

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token); // zapisujemy refresh

            toast({ title: 'Zalogowano', status: 'success' });
            return true;
        } catch (error: any) {
            toast({ title: error.message || 'Błąd logowania', status: 'error' });
            return false;
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        toast({ title: 'Wylogowano', status: 'info' });
    };

    const getUserData = () => {
        const token = localStorage.getItem('token');
        if (!token) return { email: '', name: '' };

        try {
            const decodedToken: any = jwtDecode(token);
            const email = decodedToken.email || '';
            const name = decodedToken.username || 'gość';
            const id = decodedToken.sub || '';
            const role = decodedToken.role || 'guest';
            const companyId = decodedToken.companyId || '';
            return { email, name, id, role, companyId };
        } catch (error) {
            return { email: '', name: '' };
        }
    };

    return {
        login,
        logout,
        loading,
        isAuthenticated: !!localStorage.getItem('token'),
        token: localStorage.getItem('token'),
        refreshToken: localStorage.getItem('refresh_token'),
        getUserData
    };
};
