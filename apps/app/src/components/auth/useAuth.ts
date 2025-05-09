import { useCallback, useState } from 'react';
import { useToast } from '@chakra-ui/react';

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

    return {
        login,
        logout,
        loading,
        isAuthenticated: !!localStorage.getItem('token'),
        token: localStorage.getItem('token')
    };
};
