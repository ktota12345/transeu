import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';
import { jwtDecode } from 'jwt-decode'; // Importujemy jwt-decode

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
            const res = await fetch('http://localhost:3001/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });

            if (!res.ok) throw new Error('Nieprawidłowy login lub hasło');

            const data = await res.json();
            localStorage.setItem('token', data.token);
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
        toast({ title: 'Wylogowano', status: 'info' });
    };

    // Funkcja do pobierania danych użytkownika
    const getUserData = () => {
        const token = localStorage.getItem('token');
        if (!token) return { email: '', name: '' };

        try {
            const decodedToken: any = jwtDecode(token);
            const email = decodedToken.email || '';
            const name = decodedToken.username || 'gość';
            const id = decodedToken.sub || '';
            const role = decodedToken.role || 'user';
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
        getUserData // Zwracamy funkcję getUserData
    };
};
